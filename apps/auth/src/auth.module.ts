import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/common';
import * as Joi from 'joi';
import { JwtModule } from '@nestjs/jwt';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthResolver } from './auth.resolver';
import { PassportModule } from '@nestjs/passport';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        AUTH_DATABASE_URL: Joi.string().required(),
        AUTH_GRPC_URL: Joi.string().required(),
        AUTH_JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        AUTH_JWT_ACCESS_EXPIRATION: Joi.string().required(),
        AUTH_PORT: Joi.number().required(),
      }),
    }),
    PassportModule,
    JwtModule,
    // JwtModule.registerAsync({
    //   useFactory: (configService: ConfigService) => ({
    //     secret: configService.getOrThrow('AUTH_JWT_ACCESS_TOKEN_SECRET'),
    //     signOptions: {
    //       expiresIn: `${configService.getOrThrow('AUTH_JWT_ACCESS_EXPIRATION')}s`,
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      playground: false,
      context: ({ req, res }) => ({ req, res }),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      autoSchemaFile: {
        federation: 2,
      },
    }),
    LoggerModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    AuthResolver,
  ],
})
export class AuthModule {}
