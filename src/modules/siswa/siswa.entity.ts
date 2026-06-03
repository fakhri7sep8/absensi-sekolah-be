import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Kelas } from '../kelas/kelas.entity';
import { Absensi } from '../absensi/absensi.entity';

@Entity('siswa')
export class Siswa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nama: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  nis: string;

  @Column()
  kelas_id: number;

  @ManyToOne(() => Kelas, (kelas) => kelas.siswa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'kelas_id' })
  kelas: Kelas;

  @OneToMany(() => Absensi, (absensi) => absensi.siswa)
  absensi: Absensi[];

  @CreateDateColumn()
  created_at: Date;
}
