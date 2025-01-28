import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { AbstractOutEntity } from '@app/common';
import { Verification } from '../entities/verification.entity';

@InputType()
export class VerityEmailInput extends PickType(Verification, [
  'activation_code',
  'activation_token',
]) {}

@ObjectType()
export class VerityEmailOutput extends AbstractOutEntity {}
