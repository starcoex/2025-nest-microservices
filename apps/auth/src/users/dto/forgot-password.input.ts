import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { AbstractOutEntity } from '@app/common';
import { User } from '../entities/user.entity';

@InputType()
export class ForgotPasswordInput extends PickType(User, ['email']) {}

@ObjectType()
export class ForgotPasswordOutput extends AbstractOutEntity {
  @Field(() => String, { nullable: true })
  message?: string;
}
