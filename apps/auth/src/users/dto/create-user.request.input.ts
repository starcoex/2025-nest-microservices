import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserRequestInput {
  @IsString()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  phone_number?: string;

  @IsOptional()
  avatar?: string;
}
