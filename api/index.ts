import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module'; // Pastikan path-nya bener mengarah ke src lo
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export const createNestServer = async (expressInstance) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  
  // Konfigurasi CORS disamain sama main.ts lo
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });
  
  // Vercel Serverless gak pakai app.listen(), tapi pakai app.init()
  await app.init();
};

export default async (req: any, res: any) => {
  await createNestServer(server);
  server(req, res);
};