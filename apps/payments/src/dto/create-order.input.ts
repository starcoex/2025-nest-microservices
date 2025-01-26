import { InputType, PickType } from '@nestjs/graphql';
import { Order } from '../entities/payment.entity';

@InputType()
export class CreateOrderInput extends PickType(Order, ['amount']) {}
