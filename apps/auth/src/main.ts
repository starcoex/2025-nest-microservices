import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@app/common/types/proto/auth';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: AUTH_PACKAGE_NAME,
      protoPath: join(__dirname, '../../../proto/auth.proto'),
      url: app.get(ConfigService).getOrThrow('AUTH_GRPC_URL'),
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
  // app.enableCors({
  //   origin: 'http://localhost:3000',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // });
  const port = app.get(ConfigService).getOrThrow('AUTH_PORT') || 3102;
  app.useLogger(app.get(PinoLogger));
  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/`);
}
bootstrap();
