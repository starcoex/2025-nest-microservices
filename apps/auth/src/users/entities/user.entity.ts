import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { AbstractEntity } from '@app/common/graphql';

@InputType('AvatarsInput', { isAbstract: true })
@ObjectType()
export class Avatars extends AbstractEntity {
  @Field()
  @IsString()
  public_id: string;

  @Field()
  @IsString()
  url: string;

  @Field(() => Int)
  @IsNumber()
  userId: number;
}

@InputType('UserInput', { isAbstract: true })
@ObjectType()
export class User extends AbstractEntity {
  @Field()
  @IsNotEmpty({ message: '이름은 필수입니다.' })
  @IsString()
  @Length(2, 30, {
    message: '이름은 최소 한글자 이상이거나 최대 15글자 이하입니다.',
  })
  name: string;

  @Field()
  @IsNotEmpty({ message: '메일은 필수 입니다.' })
  @IsEmail({}, { message: '메일 형식이 잘못 되었습니다.' })
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        '비밀번호는 대문자 1자, 소문자 1자, 숫자 1자, 특수문자 1자 이상을 포함해야 합니다.',
    },
  )
  password: string;

  @Field(() => String, { nullable: true })
  @ValidateIf((o) => o.passwordConfirmation != null)
  @IsNotEmpty()
  passwordConfirmation?: string;

  @Field()
  @IsNotEmpty({ message: '번호는 필수입니다.' })
  @IsPhoneNumber('KR', { message: '번호가 한국이 아닙니다.' })
  phone_number: string;

  @Field({ nullable: true })
  @IsOptional()
  access_token?: string;

  @Field({ nullable: true })
  @IsOptional()
  refresh_token?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  roles?: string[];

  @Field(() => Avatars, { nullable: true })
  avatars?: Avatars;
}
