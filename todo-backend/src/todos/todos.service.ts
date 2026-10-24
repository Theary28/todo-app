import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { Todo } from './entities/todo.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Every query is scoped to ownerId: another user's todo is reported as not found.
@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private repo: Repository<Todo>,
  ) {}

  findAll(ownerId: string) {
    return this.repo.find({ where: { ownerId }, order: { id: 'ASC' } });
  }

  create(dto: CreateTodoDto, ownerId: string) {
    return this.repo.save(this.repo.create({ ...dto, ownerId }));
  }

  async update(id: number, dto: UpdateTodoDto, ownerId: string) {
    const todo = await this.repo.findOneBy({ id, ownerId });
    if (!todo) throw new NotFoundException(`Todo #${id} not found`);
    return this.repo.save(this.repo.merge(todo, dto));
  }

  async remove(id: number, ownerId: string) {
    const result = await this.repo.delete({ id, ownerId });
    if (!result.affected) throw new NotFoundException(`Todo #${id} not found`);
  }
}
