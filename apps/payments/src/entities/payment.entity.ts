import {
  ObjectType,
  Field,
  InputType,
  registerEnumType,
  Float,
} from '@nestjs/graphql';
import { IsDate, IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

enum PaymentStatus {
  READY = 'READY',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });
registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

@InputType('PaymentInput', { isAbstract: true })
@ObjectType()
export class Payment {
  @Field()
  @IsString()
  id: string;

  @Field(() => Float)
  @IsString()
  amount: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  impUid?: string;

  @Field()
  @IsString()
  merchantUid: string;

  @Field(() => PaymentStatus)
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @IsDate()
  @Type(() => Date)
  @Field(() => Date)
  @IsOptional()
  paidAt?: Date;

  @IsDate()
  @Type(() => Date)
  @Field(() => Date)
  created_at: Date;

  @Field()
  @IsString()
  orderId: string;
}

@InputType('OrderInput', { isAbstract: true })
@ObjectType()
export class Order {
  @Field()
  @IsString()
  id: string;

  @Field(() => Float)
  @IsString()
  amount: number;

  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsDate()
  @Type(() => Date)
  @Field(() => Date)
  created_at: Date;

  @Field(() => Payment, { nullable: true })
  payment?: Payment;
}
