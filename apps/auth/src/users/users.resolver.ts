import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput, CreateUserOutput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guard/gql-auth.guard';
import { GqlCurrentUser } from '@app/common';
import { AccessAuthGuard } from '../guard/access-auth.guard';
import { UpdateInput, UpdateOutput } from './dto/update-input';

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
  // @UseGuards(GqlAuthGuard)
  getUsers(@GqlCurrentUser() user: User) {
    return this.usersService.getUsers();
  }

  @Query(() => User)
  async me(@Args('id') id: number) {}

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AccessAuthGuard)
  @Mutation(() => UpdateOutput)
  updateGql(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateInput') updateInput: UpdateInput,
  ): Promise<UpdateOutput> {
    return this.usersService.updateGql(id, updateInput);
  }

  @Mutation(() => User)
  updateUserPassword(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.usersService.updateUserPassword(updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }
}
