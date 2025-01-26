import { InputType, PickType } from '@nestjs/graphql';
import { Payment } from '../entities/payment.entity';

@InputType()
export class CreatePaymentInput extends PickType(Payment, ['impUid']) {}
