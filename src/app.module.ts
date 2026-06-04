import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AbsensiModule } from './modules/absensi/absensi.module';
import { KelasModule } from './modules/kelas/kelas.module';
import { SiswaModule } from './modules/siswa/siswa.module';
import { NotifikasiModule } from './modules/notifikasi/notifikasi.module';
import { LaporanModule } from './modules/laporan/laporan.module';
import { Guru } from './modules/auth/guru.entity';
import { Absensi } from './modules/absensi/absensi.entity';
import { Notifikasi } from './modules/notifikasi/notifikasi.entity';
import { Siswa } from './modules/siswa/siswa.entity';
import { Kelas } from './modules/kelas/kelas.entity';

@Module({
  imports: [
    // 1. KONEKSI UTAMA WAJIB DI PALING ATAS
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3307'),
      username: process.env.DB_USER || process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'absensi_sekolah',
      entities: [Guru, Siswa, Kelas, Absensi, Notifikasi],
      // synchronize: process.env.NODE_ENV !== 'production',
      synchronize: true,
      logging: false,
      // 2. TAMBAHKAN CONFIG SSL INI BIAR BISA KONEK TIDB CLOUD
      ssl: process.env.NODE_ENV === 'production' || process.env.DB_HOST !== 'localhost' 
        ? { rejectUnauthorized: false } 
        : false,
    }),
    // 3. BARU SETELAHNYA BOLEH SEPERTI INI
    TypeOrmModule.forFeature([Kelas]),
    AuthModule,
    AbsensiModule,
    KelasModule,
    SiswaModule,
    NotifikasiModule,
    LaporanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}