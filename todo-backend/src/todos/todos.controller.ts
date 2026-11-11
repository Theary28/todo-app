import { Body, Controller, Delete, Get, HttpCode, Param,
ParseIntPipe, Patch, Post } from "@nestjs/common";
import { TodosService } from "./todos.service.js";
import { CreateTodoDto } from "./dto/create-todo.dto.js";
import { UpdateTodoDto } from "./dto/update-todo.dto.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import type { AuthUser } from "../auth/decorators/current-user.decorator.js";

@Controller("todos")
export class TodosController {
constructor(private readonly todos: TodosService) {}
@Get()
findAll(@CurrentUser() user: AuthUser) { return this.todos.findAll(user.id); }

@Post()
create(@Body() dto: CreateTodoDto, @CurrentUser() user: AuthUser) {
return this.todos.create(dto, user.id); // 201 by default
}
@Patch(":id")
update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateTodoDto,
@CurrentUser() user: AuthUser) {
return this.todos.update(id, dto, user.id);
}
@Delete(":id")
@HttpCode(204)
remove(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
return this.todos.remove(id, user.id);
}
}