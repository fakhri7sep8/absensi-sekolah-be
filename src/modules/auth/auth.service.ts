import { Injectable, UnauthorizedException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Guru } from './guru.entity';
import { ForgotPasswordDto, LoginDto, ResetPasswordDto } from './auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Guru)
    private guruRepository: Repository<Guru>,
    private jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.ensureResetPasswordColumns();
  }

  private async ensureResetPasswordColumns() {
    const database = this.dataSource.options.database;
    if (!database) return;

    const [codeColumn] = await this.dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.columns
        WHERE table_schema = ?
          AND table_name = 'akun'
          AND column_name = 'reset_password_code_hash'
      `,
      [database],
    );

    const [expiresColumn] = await this.dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.columns
        WHERE table_schema = ?
          AND table_name = 'akun'
          AND column_name = 'reset_password_expires_at'
      `,
      [database],
    );

    if (Number(codeColumn?.total || 0) === 0) {
      await this.dataSource.query(
        `ALTER TABLE akun ADD COLUMN reset_password_code_hash varchar(255) NULL`,
      );
    }

    if (Number(expiresColumn?.total || 0) === 0) {
      await this.dataSource.query(
        `ALTER TABLE akun ADD COLUMN reset_password_expires_at datetime NULL`,
      );
    }
  }

  /**
   * Authenticate guru dengan email dan password
   * @param loginDto - Email dan password
   * @returns JWT token dan data guru
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Cari guru berdasarkan email
    const guru = await this.guruRepository.findOne({
      where: { email },
    });

    if (!guru) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Bandingkan password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, guru.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Generate JWT token
    const payload = { sub: guru.id, email: guru.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      guru: {
        id: guru.id,
        nama: guru.nama,
        email: guru.email,
        role: guru.role,
      },
    };
  }

  /**
   * Validate JWT token payload
   * @param payload - JWT payload
   * @returns Guru data jika valid
   */
  async validateUser(payload: any) {
    const guru = await this.guruRepository.findOne({
      where: { id: payload.sub },
    });
    return guru || null;
  }

  async ensureDefaultAccounts() {
    const defaults = [
      { nama: 'Budi Santoso', email: 'budi@sekolah.com', role: 'guru', password: 'password123' },
      { nama: 'Siti Nurhaliza', email: 'siti@sekolah.com', role: 'guru', password: 'password123' },
      { nama: 'Ahmad Wijaya', email: 'ahmad@sekolah.com', role: 'kepsek', password: 'password123' },
    ];

    for (const account of defaults) {
      const exists = await this.guruRepository.findOne({ where: { email: account.email } });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(account.password, 10);
        await this.guruRepository.save(
          this.guruRepository.create({
            nama: account.nama,
            email: account.email,
            role: account.role,
            password: hashedPassword,
          }),
        );
      }
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const guru = await this.guruRepository.findOne({ where: { email: dto.email } });
    if (!guru) {
      throw new BadRequestException('Email tidak ditemukan');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    guru.reset_password_code_hash = codeHash;
    guru.reset_password_expires_at = expiresAt;
    await this.guruRepository.save(guru);

    return {
      message: 'Kode reset password telah dibuat',
      debug_code: code,
      expires_at: expiresAt,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const guru = await this.guruRepository.findOne({ where: { email: dto.email } });
    if (!guru || !guru.reset_password_code_hash || !guru.reset_password_expires_at) {
      throw new BadRequestException('Kode reset tidak valid');
    }

    if (new Date() > new Date(guru.reset_password_expires_at)) {
      throw new BadRequestException('Kode reset sudah kedaluwarsa');
    }

    const isValid = await bcrypt.compare(dto.code, guru.reset_password_code_hash);
    if (!isValid) {
      throw new BadRequestException('Kode reset tidak valid');
    }

    guru.password = await bcrypt.hash(dto.new_password, 10);
    guru.reset_password_code_hash = null;
    guru.reset_password_expires_at = null;
    await this.guruRepository.save(guru);

    return { message: 'Password berhasil diubah' };
  }
}
