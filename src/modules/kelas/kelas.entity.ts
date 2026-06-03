import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Siswa } from '../siswa/siswa.entity';
import { Absensi } from '../absensi/absensi.entity';

@Entity('kelas')
export class Kelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  nama_kelas: string;

  @Column({ type: 'int' })
  tingkat: number;

  @OneToMany(() => Siswa, (siswa) => siswa.kelas)
  siswa: Siswa[];

  @OneToMany(() => Absensi, (absensi) => absensi.kelas)
  absensi: Absensi[];

  @CreateDateColumn()
  created_at: Date;
}
