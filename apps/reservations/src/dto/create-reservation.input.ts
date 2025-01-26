import { Field, InputType, PickType } from '@nestjs/graphql';
import { Reservation } from '../entities/reservation.entity';
import { Type } from 'class-transformer';
import { IsNotEmptyObject, ValidateNested } from 'class-validator';
import { CreateChargeInput } from '@app/common';

@InputType()
export class CreateReservationInput extends PickType(Reservation, [
  'startDate',
  'endDate',
]) {
  @Field()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CreateChargeInput)
  payment: CreateChargeInput;
}
