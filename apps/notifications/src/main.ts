import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { NotificationsModule } from './notifications.module';
import { Transport } from '@nestjs/microservices';
import { NOTIFICATIONS_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(NotificationsModule);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: NOTIFICATIONS_PACKAGE_NAME,
      protoPath: join(__dirname, '../../../proto/notifications.proto'),
      url: app.get(ConfigService).getOrThrow('NOTIFICATIONS_GRPC_URL'),
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  const port = app.get(ConfigService).getOrThrow('NOTIFICATIONS_PORT') || 3103;
  app.useLogger(app.get(PinoLogger));
  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/`);
}
bootstrap();
