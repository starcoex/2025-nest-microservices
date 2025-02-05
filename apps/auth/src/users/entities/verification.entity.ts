import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { AbstractEntity } from '@app/common';
import { User } from './user.entity';
import { IsString } from 'class-validator';

@InputType('VerificationInput', { isAbstract: true })
@ObjectType()
export class Verification extends AbstractEntity {
  @Field(() => String)
  @IsString()
  activation_code: string;

  @Field(() => String)
  @IsString()
  activation_token: string;

  @Field(() => User, { nullable: true })
  user?: User;
}
