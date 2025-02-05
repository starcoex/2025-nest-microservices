import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { TokenPayload } from '@app/common';
import { UsersService } from './users/users.service';
import { LoginInput, LoginOutput } from './dto/login.input';
import { TokensOutput } from './dto/tokens-input';
import { PrismaService } from '../prisma/prisma.service';
import { LogoutInput, LogoutOutput } from './dto/logout.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
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
    const access_token = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('AUTH_JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('AUTH_JWT_ACCESS_EXPIRATION')}s`,
    });
    const refresh_token = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('AUTH_JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('AUTH_JWT_REFRESH_EXPIRATION')}s`,
    });
    await this.usersService.updateUser(user.id, refresh_token);
    response.cookie('Authentication', access_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });
    response.cookie('Refresh', refresh_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });
    if (redirect) {
      response.redirect(this.configService.getOrThrow('AUTH_UI_REDIRECT'));
    }
  }

  async loginGraphql(loginInput: LoginInput): Promise<LoginOutput> {
    try {
      const { email, password, remember_me } = loginInput;
      const user = await this.usersService.verifyUser(email, password);
      if (!user.activate) {
        return { ok: false, error: '이메일 인증이 안 되었습니다.' };
      }
      const token = await this.usersService.getTokens(user.id);
      await this.usersService.updateUser(user.id, token.refresh_token);

      return {
        user,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        ok: true,
      };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async refreshTokensGql(
    userId: number,
    refresh_token: string,
  ): Promise<TokensOutput> {
    try {
      const user = await this.usersService.getUser(userId);
      if (!user || !refresh_token) {
        return {
          ok: false,
          error: '접근이 거부 되었습니다.',
        };
      }
      const refreshTokenMatches = await bcrypt.compare(
        refresh_token,
        user.refresh_token,
      );
      if (!refreshTokenMatches) {
        return {
          ok: false,
          error: '재발급 토근이 거부 되었습니다..',
        };
      }
      const tokens = await this.usersService.getTokens(user.id);
      await this.usersService.updateUser(user.id, tokens.refresh_token);
      return {
        ok: true,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async logOutGql(logoutInput: LogoutInput): Promise<LogoutOutput> {
    try {
      const isLoggedOut = await this.prismaService.user.update({
        where: { id: logoutInput.id },
        data: { refresh_token: null },
      });
      if (isLoggedOut) {
        return {
          ok: true,
        };
      }
      return { ok: false };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
