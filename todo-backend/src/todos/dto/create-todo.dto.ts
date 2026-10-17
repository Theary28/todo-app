import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TODO_STATUSES, type TodoStatus } from '../entities/todo.entity.js';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsIn(TODO_STATUSES)
  status?: TodoStatus;

  @IsOptional()
  @IsBoolean()
  starred?: boolean;
}
