export class LaporanQueryDto {
  bulan: number;
  tahun: number;
  kelas_id: number;
}

export class RekapLaporanItemDto {
  nama: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
}
