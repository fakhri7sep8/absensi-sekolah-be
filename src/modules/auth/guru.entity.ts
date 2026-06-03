import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('akun')
export class Guru {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nama: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, default: 'guru' })
  role: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reset_password_code_hash: string | null;

  @Column({ type: 'datetime', nullable: true })
  reset_password_expires_at: Date | null;

  @CreateDateColumn()
  created_at: Date;
}
