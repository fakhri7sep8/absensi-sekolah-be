import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Absensi } from './absensi.entity';
import { Notifikasi } from '../notifikasi/notifikasi.entity';
import { CreateAbsensiDto, CreateAbsensiBatchDto, RekapBulananDto } from './absensi.dto';
import { Siswa } from '../siswa/siswa.entity';

@Injectable()
export class AbsensiService {
  constructor(
    @InjectRepository(Absensi)
    private absensiRepository: Repository<Absensi>,
    @InjectRepository(Notifikasi)
    private notifikasiRepository: Repository<Notifikasi>,
    @InjectRepository(Siswa)
    private siswaRepository: Repository<Siswa>,
  ) {}

  private normalizeDate(input: string) {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Tanggal harus berformat date yang valid');
    }
    return date;
  }

  private normalizeDateKey(input: string) {
    const date = this.normalizeDate(input);
    return date.toISOString().slice(0, 10);
  }

  /**
   * Submit absensi baru
   * Jika validasi gagal, simpan notifikasi error
   */
  async submitAbsensi(createAbsensiDto: CreateAbsensiDto) {
    const { siswa_id, kelas_id, guru_id, tanggal, status } = createAbsensiDto;

    try {
      const validStatus = ['hadir', 'sakit', 'izin', 'alpha'];
      if (!validStatus.includes(status)) {
        throw new BadRequestException(
          'Status absensi harus salah satu dari: hadir, sakit, izin, alpha',
        );
      }

      const tanggalKey = this.normalizeDateKey(tanggal);
      const existingAbsensi = await this.absensiRepository.findOne({
        where: { siswa_id, tanggal: tanggalKey as any },
      });

      if (existingAbsensi) {
        existingAbsensi.guru_id = guru_id;
        existingAbsensi.status = status;
        existingAbsensi.kelas_id = kelas_id;
        return await this.absensiRepository.save(existingAbsensi);
      }

      const newAbsensi = this.absensiRepository.create({
        siswa_id,
        kelas_id,
        guru_id,
        tanggal: tanggalKey as any,
        status,
      });

      return await this.absensiRepository.save(newAbsensi);
    } catch (error) {
      const pesan =
        error instanceof BadRequestException
          ? error.message
          : 'Gagal menyimpan absensi karena terjadi kesalahan tidak terduga';

      await this.notifikasiRepository.save({
        guru_id,
        pesan: `Gagal submit absensi: ${pesan}`,
        is_read: false,
      });

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(pesan);
    }
  }

  async submitAbsensiBatch(createAbsensiBatchDto: CreateAbsensiBatchDto) {
    const { kelas_id, guru_id, tanggal, items } = createAbsensiBatchDto;
    const tanggalKey = this.normalizeDateKey(tanggal);

    const siswaKelas = await this.siswaRepository.find({
      where: { kelas_id },
      order: { nama: 'ASC' },
    });

    if (siswaKelas.length === 0) {
      const pesan = 'Belum ada siswa pada kelas ini, absensi tidak bisa dikirim';
      await this.notifikasiRepository.save({
        guru_id,
        pesan,
        is_read: false,
      });
      throw new BadRequestException(pesan);
    }

    const siswaIds = new Set(siswaKelas.map((siswa) => siswa.id));
    const itemMap = new Map(items.map((item) => [item.siswa_id, item.status]));
    const missing = siswaKelas.filter((siswa) => !itemMap.has(siswa.id));

    if (missing.length > 0) {
      const pesan = `Absensi belum lengkap. ${missing.length} siswa belum memiliki status.`;
      await this.notifikasiRepository.save({
        guru_id,
        pesan,
        is_read: false,
      });
      throw new BadRequestException(pesan);
    }

    const invalidSiswa = items.filter((item) => !siswaIds.has(item.siswa_id));
    if (invalidSiswa.length > 0) {
      const pesan = 'Ada siswa yang tidak sesuai dengan kelas yang dipilih';
      await this.notifikasiRepository.save({
        guru_id,
        pesan,
        is_read: false,
      });
      throw new BadRequestException(pesan);
    }

    const statuses = ['hadir', 'sakit', 'izin', 'alpha'];
    const existingAbsensi = await this.absensiRepository.find({
      where: {
        tanggal: tanggalKey as any,
        siswa_id: In([...siswaIds]),
      },
    });
    const existingMap = new Map(existingAbsensi.map((item) => [item.siswa_id, item]));

    const saved: Absensi[] = [];
    for (const item of items) {
      if (!statuses.includes(item.status)) {
        const pesan = 'Status absensi harus salah satu dari: hadir, sakit, izin, alpha';
        await this.notifikasiRepository.save({
          guru_id,
          pesan,
          is_read: false,
        });
        throw new BadRequestException(pesan);
      }

      const current = existingMap.get(item.siswa_id);
      if (current) {
        current.guru_id = guru_id;
        current.status = item.status;
        current.kelas_id = kelas_id;
        saved.push(await this.absensiRepository.save(current));
      } else {
        saved.push(
          await this.absensiRepository.save(
            this.absensiRepository.create({
                siswa_id: item.siswa_id,
                kelas_id,
                guru_id,
              tanggal: tanggalKey as any,
              status: item.status,
            }),
          ),
        );
      }
    }

    return saved;
  }

  /**
   * Ambil absensi by kelas_id dan tanggal
   */
  async getAbsensi(kelas_id: number, tanggal: string) {
    const tanggalKey = this.normalizeDateKey(tanggal);
    return this.absensiRepository.find({
      where: {
        kelas_id,
        tanggal: tanggalKey as any,
      },
      relations: {
        siswa: true,
        kelas: true,
        guru: true,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Hitung rekap absensi bulanan per siswa
   * Untuk keperluan chart dan laporan
   */
  async getRekapBulanan(
    kelas_id: number,
    bulan: number,
    tahun: number,
  ): Promise<RekapBulananDto[]> {
    const result = await this.absensiRepository.query(
      `
      SELECT 
        s.id AS siswa_id,
        s.nama AS nama,
        s.nis AS nis,
        COALESCE(SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END), 0) AS hadir,
        COALESCE(SUM(CASE WHEN a.status = 'sakit' THEN 1 ELSE 0 END), 0) AS sakit,
        COALESCE(SUM(CASE WHEN a.status = 'izin' THEN 1 ELSE 0 END), 0) AS izin,
        COALESCE(SUM(CASE WHEN a.status = 'alpha' THEN 1 ELSE 0 END), 0) AS alpha,
        COUNT(a.id) AS total
      FROM siswa s
      LEFT JOIN absensi a
        ON a.siswa_id = s.id
        AND a.kelas_id = ?
        AND MONTH(a.tanggal) = ?
        AND YEAR(a.tanggal) = ?
      WHERE s.kelas_id = ?
      GROUP BY s.id, s.nama, s.nis
      ORDER BY s.nama ASC
    `,
      [kelas_id, bulan, tahun, kelas_id],
    );

    return result.map((item) => ({
      siswa_id: Number(item.siswa_id),
      nama: item.nama,
      nis: item.nis,
      hadir: Number(item.hadir) || 0,
      sakit: Number(item.sakit) || 0,
      izin: Number(item.izin) || 0,
      alpha: Number(item.alpha) || 0,
      total: Number(item.total) || 0,
    }));
  }
}
