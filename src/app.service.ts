import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './modules/auth/auth.service';
import { Kelas } from './modules/kelas/kelas.entity';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onApplicationBootstrap() {
    await this.authService.ensureDefaultAccounts();
    await this.ensureDefaultClasses();
  }

  private async ensureDefaultClasses() {
    const kelasList = [
      { nama_kelas: '1 A', tingkat: 1 },
      { nama_kelas: '1 B', tingkat: 1 },
      { nama_kelas: '1 C', tingkat: 1 },
      { nama_kelas: '1 D', tingkat: 1 },
      { nama_kelas: '2 A', tingkat: 2 },
      { nama_kelas: '2 B', tingkat: 2 },
      { nama_kelas: '2 C', tingkat: 2 },
      { nama_kelas: '2 D', tingkat: 2 },
      { nama_kelas: '3 A', tingkat: 3 },
      { nama_kelas: '3 B', tingkat: 3 },
      { nama_kelas: '3 C', tingkat: 3 },
      { nama_kelas: '3 D', tingkat: 3 },
      { nama_kelas: '4 A', tingkat: 4 },
      { nama_kelas: '4 B', tingkat: 4 },
      { nama_kelas: '4 C', tingkat: 4 },
      { nama_kelas: '4 D', tingkat: 4 },
      { nama_kelas: '5 A', tingkat: 5 },
      { nama_kelas: '5 B', tingkat: 5 },
      { nama_kelas: '5 C', tingkat: 5 },
      { nama_kelas: '5 D', tingkat: 5 },
      { nama_kelas: '6 A', tingkat: 6 },
      { nama_kelas: '6 B', tingkat: 6 },
      { nama_kelas: '6 C', tingkat: 6 },
      { nama_kelas: '6 D', tingkat: 6 },
    ];

    for (const kelas of kelasList) {
      const exists = await this.kelasRepository.findOne({ where: { nama_kelas: kelas.nama_kelas } });
      if (!exists) {
        await this.kelasRepository.save(this.kelasRepository.create(kelas));
      }
    }
  }
}
