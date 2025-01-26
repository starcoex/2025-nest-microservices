import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { setApp } from './app';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const port = app.get(ConfigService).getOrThrow('GATEWAY_PORT') || 3100;
  await app.listen(port);
  setApp(app);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/`);
}
bootstrap();
