import { InputType, PartialType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@InputType()
export class GetUserInput extends PickType(User, ['id']) {}
