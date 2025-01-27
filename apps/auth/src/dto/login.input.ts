import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { User } from '../users/entities/user.entity';
import { AbstractOutEntity } from '@app/common';

@InputType()
export class LoginInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}

@ObjectType()
export class LoginOutput extends AbstractOutEntity {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => String, { nullable: true })
  access_token?: string;

  @Field(() => String, { nullable: true })
  refresh_token?: string;
}
