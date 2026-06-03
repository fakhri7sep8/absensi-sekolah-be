import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Siswa } from './siswa.entity';
import { CreateSiswaDto, UpdateSiswaDto } from './siswa.dto';

@Injectable()
export class SiswaService {
  constructor(
    @InjectRepository(Siswa)
    private readonly siswaRepository: Repository<Siswa>,
  ) {}

  findAll() {
    return this.siswaRepository.find({
      relations: { kelas: true },
      order: { id: 'ASC' },
    });
  }

  findByKelas(kelas_id: number) {
    // Filter ini paling sering dipakai saat isi form absensi
    return this.siswaRepository.find({
      where: { kelas_id },
      relations: { kelas: true },
      order: { nama: 'ASC' },
    });
  }

  async create(dto: CreateSiswaDto) {
    const existing = await this.siswaRepository.findOne({ where: { nis: dto.nis } });
    if (existing) {
      throw new BadRequestException('NIS sudah terdaftar');
    }
    const siswa = this.siswaRepository.create(dto);
    return this.siswaRepository.save(siswa);
  }

  async update(id: number, dto: UpdateSiswaDto) {
    const siswa = await this.siswaRepository.findOne({ where: { id }, relations: { kelas: true } });
    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    const nisOwner = await this.siswaRepository.findOne({
      where: { nis: dto.nis },
    });
    if (nisOwner && nisOwner.id !== id) {
      throw new BadRequestException('NIS sudah terdaftar');
    }

    siswa.nama = dto.nama;
    siswa.nis = dto.nis;
    siswa.kelas_id = dto.kelas_id;
    return this.siswaRepository.save(siswa);
  }

  async remove(id: number) {
    const siswa = await this.siswaRepository.findOne({ where: { id } });
    if (!siswa) {
      throw new NotFoundException('Siswa tidak ditemukan');
    }

    await this.siswaRepository.remove(siswa);
    return { message: 'Siswa berhasil dihapus' };
  }
}
