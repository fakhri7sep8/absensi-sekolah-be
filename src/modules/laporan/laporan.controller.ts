import { Controller, Get, Query, Res, UseGuards, ParseIntPipe } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { LaporanService } from './laporan.service';

@Controller('laporan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Get('bulanan')
  @Roles('kepsek')
  async getLaporanBulanan(
    @Query('bulan', ParseIntPipe) bulan: number,
    @Query('tahun', ParseIntPipe) tahun: number,
    @Query('kelas_id', ParseIntPipe) kelas_id: number,
  ) {
    return this.laporanService.getLaporanBulanan(bulan, tahun, kelas_id);
  }

  @Get('export-pdf')
  @Roles('kepsek')
  async exportPDF(
    @Query('bulan', ParseIntPipe) bulan: number,
    @Query('tahun', ParseIntPipe) tahun: number,
    @Query('kelas_id', ParseIntPipe) kelas_id: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.laporanService.exportPDF(bulan, tahun, kelas_id);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  }
}
