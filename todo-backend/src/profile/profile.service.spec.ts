import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity.js';
import { User } from '../users/entities/user.entity.js';
import { ProfileService } from './profile.service.js';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(Profile), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('ProfileService per-user profiles', () => {
  const profiles = {
    findOneBy: vi.fn(),
    create: vi.fn((data: object) => data),
    save: vi.fn((data: object) => Promise.resolve(data)),
  };
  const users = { findOneByOrFail: vi.fn() };
  let service: ProfileService;

  beforeEach(async () => {
    vi.resetAllMocks();
    profiles.create.mockImplementation((data: object) => data);
    profiles.save.mockImplementation((data: object) => Promise.resolve(data));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(Profile), useValue: profiles },
        { provide: getRepositoryToken(User), useValue: users },
      ],
    }).compile();
    service = module.get<ProfileService>(ProfileService);
  });

  it('creates a default profile from the user\'s email on first access', async () => {
    profiles.findOneBy.mockResolvedValue(null);
    users.findOneByOrFail.mockResolvedValue({ id: 'u1', email: 'jane.doe@example.com' });

    const result = await service.get('u1');

    expect(profiles.findOneBy).toHaveBeenCalledWith({ userId: 'u1' });
    expect(result.email).toBe('jane.doe@example.com');
    expect(result.displayName).toBe('jane.doe');
    expect(result.username).toMatch(/^janedoe_[0-9a-f]{6}$/);
  });
});
