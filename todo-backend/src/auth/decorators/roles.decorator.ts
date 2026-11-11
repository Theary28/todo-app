import { SetMetadata } from '@nestjs/common';
import { Role } from '../../users/entities/user.entity.js';

export const ROLES_KEY = 'roles';

// Restricts a route or controller to the given roles (checked by RolesGuard).
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
