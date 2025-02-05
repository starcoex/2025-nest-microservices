import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { AbstractOutEntity } from '@app/common';
import { Verification } from '../entities/verification.entity';

@InputType()
export class CreateUserInput extends PickType(User, [
  'email',
  'password',
  'passwordConfirmation',
  'phone_number',
  `name`,
]) {}

@ObjectType()
export class CreateUserOutput extends AbstractOutEntity {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => String, { nullable: true })
  access_token?: string;

  @Field(() => String, { nullable: true })
  refresh_token?: string;

  @Field(() => String, { nullable: true })
  activation_code?: string;

  @Field(() => String, { nullable: true })
  activation_token?: string;
}
