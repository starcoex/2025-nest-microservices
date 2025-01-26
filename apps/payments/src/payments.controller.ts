import { Controller } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // @UsePipes(new ValidationPipe())
  // async createCharge(data: PaymentsCreateChargeInput) {
  //   return this.paymentsService.createCharge(data);
  // }
}
