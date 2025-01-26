import { InputType, PartialType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@InputType()
export class GetUserInput extends PartialType(
  PickType(User, ['id', 'email']),
) {}
