import { AbstractOutEntity } from '@app/common';
import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@InputType()
export class ResetPasswordInput extends PickType(User, ['password']) {
  @Field(() => String, { nullable: true })
  activation_code: string;
}

@ObjectType()
export class ResetPasswordOutput extends AbstractOutEntity {
  @Field(() => User, { nullable: true })
  user?: User;
}
