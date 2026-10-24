import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  // Each user has at most one profile.
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 50 })
  displayName: string;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
