import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import type { CookieOptions, Response } from 'express';
import { IsNull, MoreThan, QueryFailedError, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import type { JwtPayload } from './jwt.strategy.js';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PG_UNIQUE_VIOLATION = '23505';

type RefreshPayload = { sub: string; jti: string };

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
  ) {
    this.refreshSecret = config.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  async register(email: string, password: string) {
    const passwordHash = await argon2.hash(password);
    try {
      return await this.users.save(this.users.create({ email, passwordHash }));
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === PG_UNIQUE_VIOLATION
      ) {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  async validate(email: string, password: string) {
    // passwordHash is select: false, so it has to be requested explicitly.
    const user = await this.users.findOne({
      where: { email },
      select: { id: true, email: true, role: true, passwordHash: true },
    });
    // Same message for unknown email and wrong password, so emails can't be probed.
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }

  async issueTokens(user: User, res: Response) {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    const access = await this.jwt.signAsync(payload);

    // The refresh token's jti is its row id, so useRefresh can look it up directly.
    const jti = randomUUID();
    const refresh = await this.jwt.signAsync(
      { sub: user.id },
      { secret: this.refreshSecret, expiresIn: '7d', jwtid: jti },
    );
    await this.saveRefresh(jti, user.id, refresh);

    res.cookie('refresh_token', refresh, this.cookieOptions());
    return { accessToken: access };
  }

  // Verifies the refresh token and revokes it (rotation); throws 401 if it can't be used.
  async useRefresh(token: string | undefined) {
    if (!token) throw new UnauthorizedException();

    const payload = await this.jwt
      .verifyAsync<RefreshPayload>(token, { secret: this.refreshSecret })
      .catch(() => {
        throw new UnauthorizedException();
      });

    const stored = await this.refreshTokens.findOne({
      where: { id: payload.jti, userId: payload.sub },
      relations: { user: true },
    });
    if (!stored) throw new UnauthorizedException();

    // A validly signed token that was already rotated means it was stolen and replayed:
    // log the user out everywhere.
    if (stored.revokedAt || !(await argon2.verify(stored.tokenHash, token))) {
      await this.revokeAll(payload.sub);
      throw new UnauthorizedException();
    }

    await this.refreshTokens.update(stored.id, { revokedAt: new Date() });
    return stored.user;
  }

  // Revokes one refresh token (logout). A missing or invalid token has nothing to revoke.
  async revoke(token: string | undefined) {
    if (!token) return;

    const payload = await this.jwt
      .verifyAsync<RefreshPayload>(token, { secret: this.refreshSecret })
      .catch(() => null);
    if (!payload) return;

    await this.refreshTokens.update(
      { id: payload.jti, userId: payload.sub, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async revokeAll(userId: string) {
    await this.refreshTokens.update(
      { userId, revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      { revokedAt: new Date() },
    );
  }

  cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: REFRESH_TTL_MS,
    };
  }

  private async saveRefresh(id: string, userId: string, token: string) {
    await this.refreshTokens.insert({
      id,
      userId,
      tokenHash: await argon2.hash(token),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    });
  }
}
