import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule } from '@app/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailgunModule } from 'nestjs-mailgun';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MAILGUN_DOMAIN: Joi.string().required(),
        MAILGUN_USERNAME: Joi.string().required(),
        MAILGUN_FROM: Joi.string().required(),
        MAILGUN_HTTP_KEY: Joi.string().required(),
        MAILGUN_PUBLIC_KEY: Joi.string().required(),
        MAILGUN_URL: Joi.string().required(),
        NOTIFICATIONS_GRPC_URL: Joi.string().required(),
        AUTH_GRPC_URL: Joi.string().required(),
        NOTIFICATIONS_PORT: Joi.string().required(),
        NODE_MAILER_SMTP_HOST: Joi.string().required(),
        NODE_MAILER_SMTP_USER: Joi.string().required(),
        NODE_MAILER_SMTP_PASSWORD: Joi.string().required(),
      }),
    }),
    LoggerModule,
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.getOrThrow('NODE_MAILER_SMTP_HOST'),
          secure: false,
          auth: {
            user: configService.getOrThrow('NODE_MAILER_SMTP_USER'),
            pass: configService.getOrThrow('NODE_MAILER_SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: '주)스타코엑스',
        },
        template: {
          dir: join(__dirname, '/email-templates'),
          adapter: new EjsAdapter({ inlineCssEnabled: true }),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
    MailgunModule.forAsyncRoot({
      useFactory: async (configService: ConfigService) => ({
        username: configService.getOrThrow('MAILGUN_USERNAME'),
        domain: configService.getOrThrow('MAILGUN_DOMAIN'),
        key: configService.getOrThrow('MAILGUN_KEY'),
        publicKey: configService.getOrThrow('MAILGUN_PUBLIC_KEY'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
