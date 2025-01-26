import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { IGoogle } from '@app/common/interfaces/google.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private userService: UsersService,
  ) {
    super({
      clientID: configService.getOrThrow('AUTH_GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow('AUTH_GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('AUTH_GOOGLE_REDIRECT_URI'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: IGoogle,
  ) {
    return this.userService.getOrCreateUser({
      id: profile.id,
      email: profile.emails[0]?.value,
      password: '',
      name: profile.name.familyName,
      phone_number: '',
    });
  }
}
