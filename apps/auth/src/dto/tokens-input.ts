import { AbstractOutEntity } from '@app/common';
import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../users/entities/user.entity';

@InputType()
export class TokensInput extends PickType(User, ['id', 'refresh_token']) {}

@ObjectType()
export class TokensOutput extends AbstractOutEntity {
  @Field(() => String, { nullable: true })
  access_token?: string;

  @Field(() => String, { nullable: true })
  refresh_token?: string;
}
