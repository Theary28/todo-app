import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '../../users/entities/user.entity.js';

// Shape of req.user, as returned by JwtStrategy.validate().
export type AuthUser = {
  id: string;
  role: Role;
};

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest<{ user: AuthUser }>().user,
);
