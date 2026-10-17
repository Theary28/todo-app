import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { Profile } from './entities/profile.entity.js';

// The public shape returned by the API.
export type ProfileResponse = Pick<Profile, 'username' | 'displayName' | 'email'>;

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private repo: Repository<Profile>,
  ) {}

  async get(): Promise<ProfileResponse> {
    return toResponse(await this.findProfile());
  }

  async update(dto: UpdateProfileDto): Promise<ProfileResponse> {
    const profile = await this.findProfile();
    return toResponse(await this.repo.save(this.repo.merge(profile, dto)));
  }

  // No auth yet, so the app has a single profile (seeded by migration).
  private async findProfile() {
    const [profile] = await this.repo.find({ order: { id: 'ASC' }, take: 1 });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }
}

function toResponse({ username, displayName, email }: Profile): ProfileResponse {
  return { username, displayName, email };
}
