import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateKelasDto {
  @IsNotEmpty()
  @IsString()
  nama_kelas: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  tingkat: number;
}
