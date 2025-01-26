import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PaymentsController } from './payments.controller';
import { LoggerModule } from '@app/common';
import * as Joi from 'joi';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PAYMENTS_DATABASE_URL: Joi.string().required(),
        AUTH_GRPC_URL: Joi.string().required(),
        PAYMENTS_GRPC_URL: Joi.string().required(),
        PORT_ONE_STORE_ID: Joi.string().required(),
        PORT_ONE_STORE_SECRET: Joi.string().required(),
        PAYMENTS_PORT: Joi.number().required(),
      }),
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      playground: false,
      autoSchemaFile: {
        federation: 2,
      },
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    LoggerModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsResolver, PaymentsService, PrismaService],
})
export class PaymentsModule {}
