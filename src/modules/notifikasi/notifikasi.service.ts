import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notifikasi } from './notifikasi.entity';

@Injectable()
export class NotifikasiService {
  constructor(
    @InjectRepository(Notifikasi)
    private readonly notifikasiRepository: Repository<Notifikasi>,
  ) {}

  getNotifikasi(guru_id: number) {
    return this.notifikasiRepository.find({
      where: { guru_id, is_read: false },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: number, guru_id: number) {
    const notifikasi = await this.notifikasiRepository.findOne({
      where: { id, guru_id },
    });
    if (!notifikasi) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    notifikasi.is_read = true;
    return this.notifikasiRepository.save(notifikasi);
  }
}
