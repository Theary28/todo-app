import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Must be configured before listen(), otherwise they don't apply.
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  // Parses the httpOnly refresh_token cookie for POST /api/auth/refresh.
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    // Lets the browser send and receive the refresh cookie cross-origin.
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
