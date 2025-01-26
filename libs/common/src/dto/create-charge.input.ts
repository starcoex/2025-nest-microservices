import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { CardInput } from '@app/common/dto/card.input';
import { CreateChargeMessage } from '@app/common/types/proto/payments';

@InputType()
export class CreateChargeInput implements Omit<CreateChargeMessage, 'email'> {
  @Field()
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CardInput)
  card: CardInput;

  @Field()
  @IsNumber()
  amount: number;
}
