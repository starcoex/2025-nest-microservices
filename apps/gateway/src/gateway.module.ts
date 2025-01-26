import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { LoggerModule } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
} from '@app/common/types/proto/auth';
import { join } from 'path';
import { authContext } from './auth.context';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      useFactory: (configService: ConfigService) => ({
        // server: {
        //   context: authContext,
        // },
        gateway: {
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              {
                name: 'reservations',
                url: configService.getOrThrow('RESERVATIONS_GRAPHQL_URL'),
                // url: 'http://localhost:3102/graphql',
              },
              {
                name: 'auth',
                url: configService.getOrThrow('AUTH_GRAPHQL_URL'),
                // url: 'http://localhost:3101/graphql',
              },
              {
                name: 'payments',
                url: configService.getOrThrow('PAYMENTS_GRAPHQL_URL'),
              },
            ],
          }),
          // buildService({ url }) {
          //   return new RemoteGraphQLDataSource({
          //     url,
          //     willSendRequest({ request, context }) {
          //       request.http.headers.set(
          //         'user',
          //         context.user ? JSON.stringify(context.user) : null,
          //       );
          //     },
          //   });
          // },
        },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, '../../../proto/auth.proto'),
            url: configService.getOrThrow('AUTH_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [GatewayService],
})
export class GatewayModule {}
