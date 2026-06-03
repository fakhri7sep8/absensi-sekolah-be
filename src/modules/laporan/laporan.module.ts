import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaporanController } from './laporan.controller';
import { LaporanService } from './laporan.service';
import { Absensi } from '../absensi/absensi.entity';
import { Kelas } from '../kelas/kelas.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Absensi, Kelas])],
  controllers: [LaporanController],
  providers: [LaporanService],
})
export class LaporanModule {}
