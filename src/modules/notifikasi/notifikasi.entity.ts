import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Guru } from '../auth/guru.entity';

@Entity('notifikasi')
export class Notifikasi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guru_id: number;

  @ManyToOne(() => Guru, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guru_id' })
  guru: Guru;

  @Column({ type: 'text' })
  pesan: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
