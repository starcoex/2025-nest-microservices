import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsDate } from 'class-validator';
import { Type } from 'class-transformer';

@ObjectType({ isAbstract: true })
export class AbstractEntity {
  @Field(() => ID)
  id: number;

  @IsDate()
  @Type(() => Date)
  @Field(() => Date)
  created_at: Date;

  @IsDate()
  @Type(() => Date)
  @Field(() => Date)
  updated_at: Date;
}
