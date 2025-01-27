import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '@app/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('token'),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('AUTH_JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: false,
    });
  }

  async validate(payload: TokenPayload) {
    console.log('refreshToken', payload);
    return payload;
  }
}
