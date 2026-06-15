import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { KelasService } from './kelas.service';
import { CreateKelasDto } from './kelas.dto';

@Controller('kelas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KelasController {
  constructor(private readonly kelasService: KelasService) {}

  @Get()
  @Roles('guru', 'kepsek')
  findAll() {
    return this.kelasService.findAll();
  }

  @Get('init')
  @Roles('guru', 'kepsek')
  initDefaultKelas() {
    return this.kelasService.seedDefaultKelas();
  }

  @Get(':id')
  @Roles('guru', 'kepsek')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kelasService.findOne(id);
  }

  @Post()
  @Roles('guru')
  create(@Body() dto: CreateKelasDto) {
    return this.kelasService.create(dto);
  }
}
