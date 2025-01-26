import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  NOTIFICATIONS_PACKAGE_NAME,
  NOTIFICATIONS_SERVICE_NAME,
} from '@app/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NOTIFICATIONS_SERVICE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            protoPath: join(__dirname, '../../../proto/notifications.proto'),
            package: NOTIFICATIONS_PACKAGE_NAME,
            url: configService.getOrThrow('NOTIFICATIONS_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersResolver, UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
