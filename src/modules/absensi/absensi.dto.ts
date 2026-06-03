import {
  IsDateString,
  IsArray,
  ArrayMinSize,
  IsIn,
  IsInt,
  IsNotEmpty,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AbsensiItemDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  siswa_id: number;

  @IsNotEmpty()
  @IsIn(['hadir', 'sakit', 'izin', 'alpha'])
  status: string;
}

export class CreateAbsensiDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  siswa_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  kelas_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  guru_id: number;

  @IsDateString()
  @IsNotEmpty()
  tanggal: string;

  @IsNotEmpty()
  @IsIn(['hadir', 'sakit', 'izin', 'alpha'])
  status: string;
}

export class CreateAbsensiBatchDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  kelas_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  guru_id: number;

  @IsDateString()
  @IsNotEmpty()
  tanggal: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AbsensiItemDto)
  items: AbsensiItemDto[];
}

export class RekapBulananDto {
  siswa_id: number;
  nama: string;
  nis: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total: number;
}
