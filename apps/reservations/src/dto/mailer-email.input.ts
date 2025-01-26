import { IsEmail, IsString } from 'class-validator';

export class MailerEmailInput {
  @IsEmail()
  email: string;

  @IsString()
  text: string;
}

export class MailerTemplateEmailInput {
  @IsString()
  subject: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  activationCode: string;

  @IsString()
  template: string;
}
