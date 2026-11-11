import { Controller, Get } from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/entities/user.entity.js';

// RolesGuard answers 403 for any signed-in user who isn't an admin.
@Roles(Role.ADMIN)
@Controller('admin/todos')
export class AdminTodosController {
  constructor(private readonly todos: TodosService) {}

  @Get()
  findAll() {
    return this.todos.findAllForAdmin();
  }
}
