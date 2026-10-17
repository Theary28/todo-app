import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 50 })
  displayName: string;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
