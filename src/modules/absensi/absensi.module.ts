import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsensiController } from './absensi.controller';
import { AbsensiService } from './absensi.service';
import { Absensi } from './absensi.entity';
import { Notifikasi } from '../notifikasi/notifikasi.entity';
import { Siswa } from '../siswa/siswa.entity';
import { Kelas } from '../kelas/kelas.entity';
import { Guru } from '../auth/guru.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Absensi, Notifikasi, Siswa, Kelas, Guru])],
  controllers: [AbsensiController],
  providers: [AbsensiService],
  exports: [AbsensiService],
})
export class AbsensiModule {}
