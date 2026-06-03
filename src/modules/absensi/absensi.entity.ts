import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Siswa } from '../siswa/siswa.entity';
import { Kelas } from '../kelas/kelas.entity';
import { Guru } from '../auth/guru.entity';

@Entity('absensi')
@Index(['siswa_id', 'tanggal'], { unique: true })
export class Absensi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  siswa_id: number;

  @Column()
  kelas_id: number;

  @ManyToOne(() => Kelas, (kelas) => kelas.absensi, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'kelas_id' })
  kelas: Kelas;

  @Column()
  guru_id: number;

  @ManyToOne(() => Guru, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'guru_id' })
  guru: Guru;

  @Column({ type: 'date' })
  tanggal: Date;

  @Column({
    type: 'enum',
    enum: ['hadir', 'sakit', 'izin', 'alpha'],
    default: 'alpha',
  })
  status: string;

  @ManyToOne(() => Siswa, (siswa) => siswa.absensi, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'siswa_id' })
  siswa: Siswa;

  @CreateDateColumn()
  created_at: Date;
}
