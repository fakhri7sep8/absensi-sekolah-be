import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SiswaService } from './siswa.service';
import { CreateSiswaDto, UpdateSiswaDto } from './siswa.dto';

@Controller('siswa')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SiswaController {
  constructor(private readonly siswaService: SiswaService) {}

  @Get()
  @Roles('guru')
  findAll(@Query('kelas_id') kelas_id?: string) {
    if (kelas_id) {
      return this.siswaService.findByKelas(parseInt(kelas_id, 10));
    }
    return this.siswaService.findAll();
  }

  @Post()
  @Roles('guru')
  create(@Body() dto: CreateSiswaDto) {
    return this.siswaService.create(dto);
  }

  @Patch(':id')
  @Roles('guru')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSiswaDto) {
    return this.siswaService.update(id, dto);
  }

  @Delete(':id')
  @Roles('guru')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.siswaService.remove(id);
  }
}
