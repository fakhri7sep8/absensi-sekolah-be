import { IsInt, IsNotEmpty, IsString, Min, Length, Matches } from 'class-validator';

export class CreateSiswaDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 100, { message: 'Nama siswa minimal 3 karakter' })
  nama: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 20, { message: 'NIS minimal 8 angka' })
  @Matches(/^\d+$/, { message: 'NIS harus berupa angka' })
  nis: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  kelas_id: number;
}

export class UpdateSiswaDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 100, { message: 'Nama siswa minimal 3 karakter' })
  nama: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 20, { message: 'NIS minimal 8 angka' })
  @Matches(/^\d+$/, { message: 'NIS harus berupa angka' })
  nis: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  kelas_id: number;
}
