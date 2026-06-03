import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  ValidationPipe,
  UseGuards,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { AbsensiService } from './absensi.service';
import { CreateAbsensiDto, CreateAbsensiBatchDto } from './absensi.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('absensi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AbsensiController {
  constructor(private readonly absensiService: AbsensiService) {}

  /**
   * Submit absensi baru
   * POST /absensi
   */
  @Post()
  @Roles('guru')
  async submitAbsensiBatch(
    @Body(ValidationPipe) createAbsensiBatchDto: CreateAbsensiBatchDto,
  ) {
    return this.absensiService.submitAbsensiBatch(createAbsensiBatchDto);
  }

  /**
   * Get absensi by kelas dan tanggal
   * GET /absensi?kelas_id=1&tanggal=2025-05-28
   */
  @Get()
  @Roles('guru', 'kepsek')
  async getAbsensi(
    @Query('kelas_id', ParseIntPipe) kelas_id: number,
    @Query('tanggal') tanggal: string,
  ) {
    if (!kelas_id || !tanggal) {
      throw new BadRequestException('kelas_id dan tanggal harus diisi');
    }
    return this.absensiService.getAbsensi(kelas_id, tanggal);
  }

  /**
   * Get rekap absensi bulanan per siswa
   * GET /absensi/rekap?bulan=5&tahun=2025&kelas_id=1
   */
  @Get('rekap')
  @Roles('guru', 'kepsek')
  async getRekapBulanan(
    @Query('bulan', ParseIntPipe) bulan: number,
    @Query('tahun', ParseIntPipe) tahun: number,
    @Query('kelas_id', ParseIntPipe) kelas_id: number,
  ) {
    if (!bulan || !tahun || !kelas_id) {
      throw new BadRequestException('bulan, tahun, dan kelas_id harus diisi');
    }
    return this.absensiService.getRekapBulanan(kelas_id, bulan, tahun);
  }
}
