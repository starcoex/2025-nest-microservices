import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { AbstractOutEntity } from '@app/common';

@InputType()
export class UpdateInput extends PartialType(
  PickType(User, ['email', 'name', 'phone_number']),
) {}

@ObjectType()
export class UpdateOutput extends AbstractOutEntity {
  @Field(() => User, { nullable: true })
  user?: User;
}
