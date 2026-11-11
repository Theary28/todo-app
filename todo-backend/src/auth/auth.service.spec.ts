import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service.js';
import { User } from '../users/entities/user.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: { getOrThrow: () => 'test-secret' } },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(RefreshToken), useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('AuthService.revoke', () => {
  const refreshTokens = { update: vi.fn() };
  const jwt = { verifyAsync: vi.fn() };
  let service: AuthService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: { getOrThrow: () => 'test-secret' } },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(RefreshToken), useValue: refreshTokens },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('revokes only the session the token belongs to', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'u1', jti: 't1' });
    await service.revoke('token');
    expect(refreshTokens.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 't1', userId: 'u1' }),
      { revokedAt: expect.any(Date) },
    );
  });

  it('does nothing for a missing or invalid token', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('bad signature'));
    await service.revoke(undefined);
    await service.revoke('garbage');
    expect(refreshTokens.update).not.toHaveBeenCalled();
  });
});
