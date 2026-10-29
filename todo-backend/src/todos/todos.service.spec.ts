import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity.js';
import { TodosService } from './todos.service.js';

describe('TodosService', () => {
  let service: TodosService;
  const repo = {
    find: vi.fn(),
    findOneBy: vi.fn(),
    delete: vi.fn(),
    save: vi.fn(),
    merge: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodosService, { provide: getRepositoryToken(Todo), useValue: repo }],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  it('lists only the owner\'s todos', async () => {
    await service.findAll('user-1');
    expect(repo.find).toHaveBeenCalledWith({ where: { ownerId: 'user-1' }, order: { id: 'ASC' } });
  });

  it('lists every user\'s todos for an admin, exposing only the owner\'s id and email', async () => {
    await service.findAllForAdmin();
    expect(repo.find).toHaveBeenCalledWith({
      relations: { owner: true },
      select: { owner: { id: true, email: true } },
      order: { id: 'ASC' },
    });
  });

  it('treats another user\'s todo as not found on update', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.update(1, { title: 'x' }, 'user-2')).rejects.toThrow(NotFoundException);
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1, ownerId: 'user-2' });
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('only deletes a todo the user owns', async () => {
    repo.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove(1, 'user-2')).rejects.toThrow(NotFoundException);
    expect(repo.delete).toHaveBeenCalledWith({ id: 1, ownerId: 'user-2' });
  });
});
