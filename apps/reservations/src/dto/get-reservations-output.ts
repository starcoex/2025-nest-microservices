import { Field, ObjectType } from '@nestjs/graphql';
import { Reservation } from '../entities/reservation.entity';

@ObjectType()
export class GetReservationsOutput {
  @Field(() => [Reservation], { nullable: true })
  reservations?: Reservation[];
}
