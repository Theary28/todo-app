import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { Profile } from './entities/profile.entity.js';
import { User } from '../users/entities/user.entity.js';

const PG_UNIQUE_VIOLATION = '23505';

// The public shape returned by the API.
export type ProfileResponse = Pick<Profile, 'username' | 'displayName' | 'email'>;

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private repo: Repository<Profile>,
    @InjectRepository(User)
    private users: Repository<User>,
  ) {}

  async get(userId: string): Promise<ProfileResponse> {
    return toResponse(await this.findOrCreate(userId));
  }

  async update(userId: string, dto: UpdateProfileDto): Promise<ProfileResponse> {
    const profile = await this.findOrCreate(userId);
    return toResponse(await this.repo.save(this.repo.merge(profile, dto)));
  }

  // Users who registered after the demo seed get a default profile on first access.
  private async findOrCreate(userId: string) {
    const existing = await this.repo.findOneBy({ userId });
    if (existing) return existing;

    const { email } = await this.users.findOneByOrFail({ id: userId });
    try {
      return await this.repo.save(this.repo.create({ userId, email, ...defaultNames(email) }));
    } catch (error) {
      // Two first requests raced and the other one created it.
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === PG_UNIQUE_VIOLATION
      ) {
        return this.repo.findOneByOrFail({ userId });
      }
      throw error;
    }
  }
}

// "jane.doe@x.com" -> username "janedoe_3f9a1c", displayName "jane.doe".
// The random suffix keeps usernames unique and at least 3 characters long.
function defaultNames(email: string) {
  const localPart = email.split('@')[0];
  const base = localPart.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 23);
  return {
    username: `${base}_${randomBytes(3).toString('hex')}`,
    displayName: localPart.slice(0, 50),
  };
}

function toResponse({ username, displayName, email }: Profile): ProfileResponse {
  return { username, displayName, email };
}
