import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { AbstractEntity } from '@app/common/graphql';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

@InputType('ReservationInput', { isAbstract: true })
@ObjectType()
export class Reservation extends AbstractEntity {
  @Field()
  @Type(() => Date)
  @IsDate()
  timestamp: Date;

  @Field()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Field()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @Field(() => Int)
  userId: number;
}
