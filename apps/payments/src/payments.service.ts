import { Injectable } from '@nestjs/common';
import { CreatePaymentInput } from './dto/create-payment.input';
import { UpdatePaymentInput } from './dto/update-payment.input';
import { PrismaService } from '../prisma/prisma.service';
import * as server_sdk from '@portone/server-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private portOne = server_sdk.PaymentClient({
    secret: this.configService.getOrThrow('PORT_ONE_STORE_SECRET'),
    storeId: this.configService.getOrThrow('PORT_ONE_STORE_ID'),
  });

  async create(createPaymentInput: CreatePaymentInput) {
    console.log('createPaymentInput');
    console.log(this.portOne);
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentInput: UpdatePaymentInput) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
