import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../users/entities/user.entity.js';
import type { AuthUser } from './decorators/current-user.decorator.js';

// What AuthService.issueTokens signs into the access token.
export type JwtPayload = {
  sub: string;
  role: Role;
};

// Validates the Bearer token on guarded routes; the return value becomes req.user.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return { id: payload.sub, role: payload.role };
  }
}
