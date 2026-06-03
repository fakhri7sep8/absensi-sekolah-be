import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { NotifikasiService } from './notifikasi.service';

@Controller('notifikasi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotifikasiController {
  constructor(private readonly notifikasiService: NotifikasiService) {}

  @Get()
  @Roles('guru')
  getNotifikasi(@Req() req: any) {
    return this.notifikasiService.getNotifikasi(req.user.id);
  }

  @Patch(':id/read')
  @Roles('guru')
  markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.notifikasiService.markAsRead(id, req.user.id);
  }
}
