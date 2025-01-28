import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../users/entities/user.entity';
import { AbstractOutEntity } from '@app/common';

@InputType()
export class LogoutInput extends PickType(User, ['id']) {}

@ObjectType()
export class LogoutOutput extends AbstractOutEntity {}
