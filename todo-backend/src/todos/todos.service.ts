import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { Todo } from './entities/todo.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private repo: Repository<Todo>,
  ) {}

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  create(dto: CreateTodoDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateTodoDto) {
    const todo = await this.repo.findOneBy({ id });
    if (!todo) throw new NotFoundException(`Todo #${id} not found`);
    return this.repo.save(this.repo.merge(todo, dto));
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Todo #${id} not found`);
  }
}
