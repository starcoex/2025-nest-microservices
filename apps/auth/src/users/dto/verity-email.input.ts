import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { AbstractOutEntity } from '@app/common';
import { Verification } from '../entities/verification.entity';
import { User } from '../entities/user.entity';

@InputType()
export class VerityEmailInput extends PickType(Verification, [
  'activation_code',
  'activation_token',
]) {}

@InputType()
export class ResendVerificationCodeInput extends PickType(Verification, [
  'activation_token',
]) {}

@ObjectType()
export class VerityEmailOutput extends AbstractOutEntity {
  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class ResendVerificationCodeOutput extends AbstractOutEntity {}
