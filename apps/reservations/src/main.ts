import { NestFactory } from '@nestjs/core';
import { ReservationsModule } from './reservations.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(ReservationsModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
  app.setViewEngine('ejs');
  const port = app.get(ConfigService).getOrThrow('RESERVATIONS_PORT') || 3101;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/`);
}
bootstrap();
