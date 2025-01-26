import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Reservation } from '../entities/reservation.entity';

@InputType()
export class GetReservationInput extends PickType(Reservation, ['id']) {}

@ObjectType()
export class GetReservationOutput {
  @Field(() => Reservation, { nullable: true })
  reservation?: Reservation;
}
