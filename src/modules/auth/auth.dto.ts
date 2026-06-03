import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

export class AuthResponseDto {
  access_token: string;
  guru: {
    id: number;
    nama: string;
    email: string;
    role: string;
  };
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Kode reset minimal 6 karakter' })
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password baru minimal 6 karakter' })
  new_password: string;
}
