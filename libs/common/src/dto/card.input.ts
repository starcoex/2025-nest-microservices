import { IsCreditCard, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CardMessage } from '@app/common/types/proto/payments';

@InputType('CardInput', { isAbstract: true })
@ObjectType()
export class CardInput implements CardMessage {
  @Field()
  @IsString()
  @IsNotEmpty()
  cvc: string;

  @Field()
  @IsNumber()
  expMonth: number;

  @Field()
  @IsNumber()
  expYear: number;

  @Field()
  @IsCreditCard()
  number: string;
}
