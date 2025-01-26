import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { Transport } from '@nestjs/microservices';
import { PAYMENTS_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino/Logger';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsModule);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: PAYMENTS_PACKAGE_NAME,
      protoPath: join(__dirname, '../../../proto/payments.proto'),
      url: app.get(ConfigService).getOrThrow('PAYMENTS_GRPC_URL'),
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  const port = app.get(ConfigService).getOrThrow('PAYMENTS_PORT') || 3104;
  app.useLogger(app.get(PinoLogger));
  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/`);
}
bootstrap();
