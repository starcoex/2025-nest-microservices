import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from './users/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { GqlContext, GqlCurrentUser } from '@app/common';
import { LoginInput } from './dto/login.input';
import { JwtRefreshGuard } from './guard/jwt-refresh-auth.guard';
import { GqlRefreshAuthGuard } from './guard/gql-refresh-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => User)
  async loginGraphql(
    @Args('loginInput') loginInput: LoginInput,
    @Context() context: GqlContext,
  ) {
    return this.authService.loginGraphql(loginInput, context);
  }

  @Mutation(() => User)
  @UseGuards(GqlRefreshAuthGuard)
  async refreshGraphql(
    @GqlCurrentUser() user: User,
    @Context() context: GqlContext,
  ) {
    console.log('GqlCurrentUser', user);
    return this.authService.loginGraphql(user, context);
  }
}
