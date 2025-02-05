import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput, CreateUserOutput } from './dto/create-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlCurrentUser } from '@app/common';
import { AccessAuthGuard } from '../guard/access-auth.guard';
import { UpdateInput, UpdateOutput } from './dto/update-input';
import { MeUserOutput } from './dto/me-user.input';
import {
  ForgotPasswordInput,
  ForgotPasswordOutput,
} from './dto/forgot-password.input';
import {
  ResetPasswordInput,
  ResetPasswordOutput,
} from './dto/reset-password.input';
import {
  ResendVerificationCodeInput,
  ResendVerificationCodeOutput,
  VerityEmailInput,
  VerityEmailOutput,
} from './dto/verity-email.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.createUser(createUserInput);
  }

  @Mutation(() => CreateUserOutput)
  createUserGql(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<CreateUserOutput> {
    return this.usersService.createUserGql(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(AccessAuthGuard)
  getUsersGql() {
    return this.usersService.getUsersGql();
  }

  @Query(() => MeUserOutput)
  @UseGuards(AccessAuthGuard)
  async meGql(@GqlCurrentUser() user: User): Promise<MeUserOutput> {
    return this.usersService.meGql(user.id);
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(AccessAuthGuard)
  getUserGql(@GqlCurrentUser() user: User) {
    return this.usersService.getUserGql(user.id);
  }

  @UseGuards(AccessAuthGuard)
  @Mutation(() => UpdateOutput)
  updateUserGql(
    @GqlCurrentUser() user: User,
    @Args('updateInput') updateInput: UpdateInput,
  ): Promise<UpdateOutput> {
    return this.usersService.updateUserGql(user.id, updateInput);
  }

  @Mutation(() => User)
  @UseGuards(AccessAuthGuard)
  removeUserGql(@GqlCurrentUser() user: User) {
    return this.usersService.removeUserGql(user.id);
  }

  @Mutation(() => ForgotPasswordOutput, { name: 'forgotPassword' })
  async forgotPasswordGql(
    @Args('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput,
  ): Promise<ForgotPasswordOutput> {
    return this.usersService.forgotPasswordGql(forgotPasswordInput);
  }

  @Mutation(() => ResetPasswordOutput, { name: 'resetPassword' })
  async resetPasswordGql(
    @Args('resetPasswordInput') resetPasswordInput: ResetPasswordInput,
  ): Promise<ResetPasswordOutput> {
    return this.usersService.resetPasswordGql(resetPasswordInput);
  }

  @Mutation(() => VerityEmailOutput)
  async verifyEmailGql(
    @Args('verifyEmailInput') verifyEmailInput: VerityEmailInput,
  ): Promise<VerityEmailOutput> {
    return this.usersService.verifyEmailGql(verifyEmailInput);
  }

  @Mutation(() => ResendVerificationCodeOutput, {
    name: 'resendVerificationCode',
  })
  async resendVerificationCode(
    @Args('resendVerificationCodeInput')
    resendVerificationCodeInput: ResendVerificationCodeInput,
  ) {
    return this.usersService.resendVerificationCode(
      resendVerificationCodeInput,
    );
  }

  @Mutation(() => User)
  async rememberMeGql(@Args('rememberMeInput') rememberMeInput: User) {
    return this.usersService.rememberMeGql();
  }
}
