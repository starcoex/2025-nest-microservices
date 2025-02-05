import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly usersService: UsersService) {
    super({
      usernameField: `email`,
    });
  }

  async validate(email: string, password: string) {
    try {
      console.log(email, password);
      return this.usersService.verifyUser(email, password);
    } catch (err) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      });
    }
  }
}
