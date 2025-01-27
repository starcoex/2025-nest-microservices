import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { LoginInput, LoginOutput } from './dto/login.input';
import { TokensInput, TokensOutput } from './dto/tokens-input';
import { RefreshAuthGuard } from './guard/refresh-auth.guard';

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
    @Args('tokensInput') tokensInput: TokensInput,
  ): Promise<TokensOutput> {
    return this.authService.refreshTokensGql(tokensInput);
  }
}
