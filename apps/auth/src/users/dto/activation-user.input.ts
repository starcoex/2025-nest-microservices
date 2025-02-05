import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from '../entities/user.entity';

@InputType()
export class ActivationUserInput {
  @Field()
  @IsNotEmpty({ message: '활성화 토큰은 필수입니다.' })
  @IsString()
  activation_code: string;
}

@ObjectType()
export class ActivationUserOutput {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field({ nullable: true })
  access_token?: string;

  @Field({ nullable: true })
  refresh_token?: string;
}
