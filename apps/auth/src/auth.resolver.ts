import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { LoginInput, LoginOutput } from './dto/login.input';
import { TokensOutput } from './dto/tokens-input';
import { RefreshAuthGuard } from './guard/refresh-auth.guard';
import { LogoutInput } from './dto/logout.input';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginOutput)
  async loginGraphql(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<LoginOutput> {
    return this.authService.loginGraphql(loginInput);
  }

  @Mutation(() => TokensOutput)
  @UseGuards(RefreshAuthGuard)
  async refreshGraphql(
    @Args('userId') userId: number,
    @Args('refresh_token') refresh_token: string,
  ): Promise<TokensOutput> {
    return this.authService.refreshTokensGql(userId, refresh_token);
  }

  @Mutation(() => LoginOutput)
  @UseGuards(RefreshAuthGuard)
  async logOut(
    @Args('logoutInput') logoutInput: LogoutInput,
  ): Promise<LoginOutput> {
    return this.authService.logOutGql(logoutInput);
  }
}
