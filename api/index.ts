import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let cachedServer;

export const createNestServer = async (expressInstance) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  
  // Konfigurasi CORS - support multiple origins (comma-separated)
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o: string) => o.trim());

  app.enableCors({
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
  });
  
  // Vercel Serverless gak pakai app.listen(), tapi pakai app.init()
  await app.init();
};

export default async (req: any, res: any) => {
  if (!cachedServer) {
    await createNestServer(server);
    cachedServer = server;
  }
  return cachedServer(req, res);
};