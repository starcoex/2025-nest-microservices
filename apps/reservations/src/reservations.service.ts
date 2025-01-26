import { Injectable } from '@nestjs/common';
import { CreateReservationInput } from './dto/create-reservation.input';
import { UpdateReservationInput } from './dto/update-reservation.input';
import { PrismaService } from '../prisma/prisma.service';
import { IUser } from '@app/common';

@Injectable()
export class ReservationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createReservationInput: CreateReservationInput, user: IUser) {
    console.log(user);
    return 'This action adds a new reservation';
  }

  findAll() {
    return `This action returns all reservations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reservation`;
  }

  update(id: number, updateReservationInput: UpdateReservationInput) {
    return `This action updates a #${id} reservation`;
  }

  remove(id: number) {
    return `This action removes a #${id} reservation`;
  }
}
