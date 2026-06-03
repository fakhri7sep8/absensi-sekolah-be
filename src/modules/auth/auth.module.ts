import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Guru } from './guru.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guru]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret_key_development',
      signOptions: {
        expiresIn: 60 * 60 * 24 * 7, // 7 hari dalam detik
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard], // Export untuk dipakai modul lain
})
export class AuthModule {}
