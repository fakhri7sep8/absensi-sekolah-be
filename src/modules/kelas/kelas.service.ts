import { Injectable, NotFoundException } from '@nestjs/common';
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

  create(dto: CreateKelasDto) {
    // Simpan data kelas baru ke database
    const kelas = this.kelasRepository.create(dto);
    return this.kelasRepository.save(kelas);
  }
}
