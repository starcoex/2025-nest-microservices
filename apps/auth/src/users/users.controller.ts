import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { CurrentUser } from '@app/common';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() request: CreateUserInput) {
    return this.usersService.createUser(request);
  }

  // @Get()
  // @UseGuards(JwtAuthGuard)
  // async getUsers() {
  //   return this.usersService.getUsers();
  // }
}
