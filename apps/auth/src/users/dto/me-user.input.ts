import { Field, ObjectType } from '@nestjs/graphql';
import { AbstractOutEntity } from '@app/common';
import { User } from '../entities/user.entity';

@ObjectType()
export class MeUserOutput extends AbstractOutEntity {
  @Field(() => User, { nullable: true })
  user?: User;
}
