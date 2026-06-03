import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * Gunakan decorator @UseGuards(JwtAuthGuard) untuk protect routes
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
