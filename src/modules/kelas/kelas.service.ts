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
    return this.kelasRepository.find({ order: { tingkat: 'ASC', nama_kelas: 'ASC' } });
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
   * Seed default kelas: bersihkan duplikat, lalu pastikan 24 kelas (1A–6D) ada.
   * Format: "1 A", "1 B", "1 C", "1 D" s/d "6 A", "6 B", "6 C", "6 D"
   */
  async seedDefaultKelas(): Promise<Kelas[]> {
    // 1. Bersihkan duplikat — simpan hanya yang paling awal (id terkecil) per nama_kelas
    const all = await this.kelasRepository.find({ order: { id: 'ASC' } });
    const seen = new Set<string>();
    const idsToDelete: number[] = [];
    for (const k of all) {
      const key = k.nama_kelas.trim().toLowerCase();
      if (seen.has(key)) {
        idsToDelete.push(k.id);
      } else {
        seen.add(key);
      }
    }
    if (idsToDelete.length > 0) {
      await this.kelasRepository.delete(idsToDelete);
    }

    // 2. Daftar 24 kelas default
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

    // 3. Ambil data yang sudah ada setelah cleanup
    const existing = await this.kelasRepository.find();
    const existingMap = new Map<string, Kelas>();
    for (const k of existing) {
      existingMap.set(k.nama_kelas.trim().toLowerCase(), k);
    }

    // 4. Insert yang belum ada
    for (const item of defaultKelas) {
      const key = item.nama_kelas.trim().toLowerCase();
      if (!existingMap.has(key)) {
        const kelas = this.kelasRepository.create(item);
        await this.kelasRepository.save(kelas);
      }
    }

    // 5. Return semua data yang sudah bersih
    return this.findAll();
  }
}
