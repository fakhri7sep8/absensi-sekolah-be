import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Absensi } from '../absensi/absensi.entity';
import { Kelas } from '../kelas/kelas.entity';
import { RekapLaporanItemDto } from './laporan.dto';

const PDFDocument = require('pdfkit');

@Injectable()
export class LaporanService {
  constructor(
    @InjectRepository(Absensi)
    private readonly absensiRepository: Repository<Absensi>,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
  ) {}

  async getLaporanBulanan(
    bulan: number,
    tahun: number,
    kelas_id: number,
  ): Promise<RekapLaporanItemDto[]> {
    const rows = await this.absensiRepository.query(
      `
      SELECT
        s.nama AS nama,
        COALESCE(SUM(CASE WHEN a.status = 'hadir' THEN 1 ELSE 0 END), 0) AS hadir,
        COALESCE(SUM(CASE WHEN a.status = 'sakit' THEN 1 ELSE 0 END), 0) AS sakit,
        COALESCE(SUM(CASE WHEN a.status = 'izin' THEN 1 ELSE 0 END), 0) AS izin,
        COALESCE(SUM(CASE WHEN a.status = 'alpha' THEN 1 ELSE 0 END), 0) AS alpha
      FROM siswa s
      LEFT JOIN absensi a
        ON a.siswa_id = s.id
        AND a.kelas_id = ?
        AND MONTH(a.tanggal) = ?
        AND YEAR(a.tanggal) = ?
      WHERE s.kelas_id = ?
      GROUP BY s.id, s.nama
      ORDER BY s.nama ASC
      `,
      [kelas_id, bulan, tahun, kelas_id],
    );

    return rows.map((row) => ({
      nama: row.nama,
      hadir: Number(row.hadir) || 0,
      sakit: Number(row.sakit) || 0,
      izin: Number(row.izin) || 0,
      alpha: Number(row.alpha) || 0,
    }));
  }

  async exportPDF(
    bulan: number,
    tahun: number,
    kelas_id: number,
  ): Promise<Buffer> {
    const kelas = await this.kelasRepository.findOne({ where: { id: kelas_id } });
    const rekap = await this.getLaporanBulanan(bulan, tahun, kelas_id);

    const bulanNama = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ][bulan - 1] || String(bulan);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    doc.fontSize(18).text('Laporan Absensi Bulanan', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Kelas: ${kelas?.nama_kelas ?? '-'}`);
    doc.text(`Periode: ${bulanNama} ${tahun}`);
    doc.moveDown(1);

    const startX = 40;
    let y = doc.y;
    const widths = [180, 55, 55, 55, 55];

    const drawRow = (values: string[], isHeader = false) => {
      let x = startX;
      values.forEach((value, index) => {
        doc.fontSize(isHeader ? 11 : 10).text(value, x, y, {
          width: widths[index],
          align: index === 0 ? 'left' : 'center',
        });
        x += widths[index];
      });
      y += 22;
    };

    drawRow(['Nama', 'Hadir', 'Sakit', 'Izin', 'Alpha'], true);
    doc.moveTo(startX, y - 4).lineTo(startX + widths.reduce((a, b) => a + b, 0), y - 4).stroke();

    for (const item of rekap) {
      drawRow([
        item.nama,
        String(item.hadir),
        String(item.sakit),
        String(item.izin),
        String(item.alpha),
      ]);
    }

    doc.end();
    return pdfPromise;
  }
}
