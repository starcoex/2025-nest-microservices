import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { CurrentUser } from '@app/common/decorator/current-user.decorator';
import { User } from './users/entities/user.entity';
import { Response } from 'express';
import {
  AuthServiceController,
  AuthServiceControllerMethods,
} from '@app/common/types/proto/auth';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { Payload } from '@nestjs/microservices';
import { JwtRefreshGuard } from './guard/jwt-refresh-auth.guard';
import { GoogleAuthGuard } from './guard/google-auth.guard';

@Controller('auth')
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  loginGoogle() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response, true);
  }

  @UseGuards(JwtAuthGuard)
  async authenticate(@Payload() data: any) {
    return {
      ...data.user,
      id: data.user.id,
    };
  }
}
