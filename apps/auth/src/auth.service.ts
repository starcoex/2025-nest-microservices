import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { Response } from 'express';
import { GqlContext, TokenPayload } from '@app/common';
import { UsersService } from './users/users.service';
import { LoginInput } from './dto/login.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async login(user: User, response: Response, redirect = false) {
    const tokenPayload: TokenPayload = {
      userId: user.id,
    };
    const expiresAccessToken = new Date();
    expiresAccessToken.setTime(
      expiresAccessToken.getSeconds() +
        this.configService.getOrThrow('AUTH_JWT_ACCESS_EXPIRATION'),
    );
    const expiresRefreshToken = new Date();
    expiresRefreshToken.setTime(
      expiresRefreshToken.getSeconds() +
        this.configService.getOrThrow('AUTH_JWT_REFRESH_EXPIRATION'),
    );
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('AUTH_JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('AUTH_JWT_ACCESS_EXPIRATION')}s`,
    });
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('AUTH_JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('AUTH_JWT_REFRESH_EXPIRATION')}s`,
    });
    // await this.usersService.updateUser(
    //   { id: user.id },
    //   { refresh_token: refreshToken },
    // );
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });
    // response.cookie('Refresh', refreshToken, {
    //   httpOnly: true,
    //   secure: this.configService.get('NODE_ENV') === 'production',
    //   expires: expiresRefreshToken,
    // });
    // if (redirect) {
    //   response.redirect(this.configService.getOrThrow('AUTH_UI_REDIRECT'));
    // }
  }

  async loginGraphql(
    loginInput: LoginInput,
    context: GqlContext,
    redirect = false,
  ) {
    const { email, password } = loginInput;
    const user = await this.usersService.verifyUser(email, password);
    const token_payload: TokenPayload = {
      userId: user.id,
    };
    const expiresAccessToken = new Date();
    expiresAccessToken.setTime(
      expiresAccessToken.getSeconds() +
        this.configService.getOrThrow('AUTH_JWT_ACCESS_EXPIRATION'),
    );
    const expiresRefreshToken = new Date();
    expiresRefreshToken.setTime(
      expiresRefreshToken.getSeconds() +
        this.configService.getOrThrow('AUTH_JWT_REFRESH_EXPIRATION'),
    );
    const accessToken = this.jwtService.sign(token_payload, {
      secret: this.configService.getOrThrow('AUTH_JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('AUTH_JWT_ACCESS_EXPIRATION')}s`,
    });
    const refreshToken = this.jwtService.sign(token_payload, {
      secret: this.configService.getOrThrow('AUTH_JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('AUTH_JWT_REFRESH_EXPIRATION')}s`,
    });
    await this.usersService.updateUser(
      { id: user.id },
      { access_token: accessToken, refresh_token: refreshToken },
    );
    context.res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });
    context.res.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });
    if (redirect) {
      context.res.redirect(this.configService.getOrThrow('AUTH_UI_REDIRECT'));
    }
    return user;
  }
}
