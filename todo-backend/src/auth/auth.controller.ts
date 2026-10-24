import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { SignupDto } from '../users/dto/signup.dto.js';
import { LoginDto } from '../users/dto/log.dto.js';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { AuthUser } from './decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.register(dto.email, dto.password);
    return this.auth.issueTokens(user, res);
  }

  @Public()
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.auth.validate(dto.email, dto.password);
    return this.auth.issueTokens(user, res);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['refresh_token'] as string | undefined;
    const user = await this.auth.useRefresh(token); // verify + rotate, else 401
    return this.auth.issueTokens(user, res); // new access + new refresh
  }

  // Public so it still works after the access token expires: the refresh cookie
  // identifies the session, and only that session is ended.
  @Public()
  @HttpCode(204)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.revoke(req.cookies['refresh_token'] as string | undefined);
    const { maxAge: _maxAge, ...cookieOptions } = this.auth.cookieOptions();
    res.clearCookie('refresh_token', cookieOptions);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.users.findOneByOrFail({ id: user.id });
  }
}
