import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kelas } from './kelas.entity';
import { CreateKelasDto } from './kelas.dto';

@Injectable()
export class KelasService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
  ) {}

  findAll() {
    return this.kelasRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const kelas = await this.kelasRepository.findOne({ where: { id } });
    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }
    return kelas;
  }

  async create(dto: CreateKelasDto) {
    // Cek duplikasi berdasarkan nama_kelas (case-insensitive)
    const existing = await this.kelasRepository.findOne({
      where: { nama_kelas: dto.nama_kelas },
    });
    if (existing) {
      throw new ConflictException(`Kelas "${dto.nama_kelas}" sudah ada di database.`);
    }
    const kelas = this.kelasRepository.create(dto);
    return this.kelasRepository.save(kelas);
  }

  /**
   * Seed default kelas jika belum ada data.
   * Format: 1A, 1B, 1C, 1D s/d 6A, 6B, 6C, 6D
   */
  async seedDefaultKelas(): Promise<Kelas[]> {
    const count = await this.kelasRepository.count();
    if (count > 0) {
      // Jika sudah ada data, return semua
      return this.findAll();
    }

    const defaultKelas: CreateKelasDto[] = [];
    const suffixes = ['A', 'B', 'C', 'D'];
    for (let tingkat = 1; tingkat <= 6; tingkat++) {
      for (const suffix of suffixes) {
        defaultKelas.push({
          nama_kelas: `${tingkat} ${suffix}`,
          tingkat,
        });
      }
    }

    const created: Kelas[] = [];
    for (const item of defaultKelas) {
      const kelas = this.kelasRepository.create(item);
      const saved = await this.kelasRepository.save(kelas);
      created.push(saved);
    }
    return created;
  }
}
