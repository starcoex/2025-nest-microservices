import { InputType, PartialType, PickType } from '@nestjs/graphql';
import { User } from '../users/entities/user.entity';

@InputType()
export class LoginInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}
