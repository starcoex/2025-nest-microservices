import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { isValidPhoneNumber, AsYouType } from 'libphonenumber-js';
import {
  NOTIFICATIONS_SERVICE_NAME,
  NotificationsServiceClient,
} from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { join } from 'path';
import { Prisma } from '.prisma/client';
import { CreateUserRequestInput } from './dto/create-user.request.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  private notificationsService: NotificationsServiceClient;
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(NOTIFICATIONS_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.notificationsService =
      this.client.getService<NotificationsServiceClient>(
        NOTIFICATIONS_SERVICE_NAME,
      );
  }

  private async checkPasswordHistory(email: string, newPasswordPlain: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) {
      return;
    }
    const passwordHistory = await this.prismaService.passwordHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    for (const history of passwordHistory) {
      if (await bcrypt.compare(newPasswordPlain, history.password)) {
        throw new BadRequestException('이미 이 비밀번호를 사용하셨습니다.');
      }
    }
  }

  async validatePasswordChange(userId: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const history = await this.prismaService.passwordHistory.findMany({
      where: { userId },
      select: { password: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    const isPasswordReused = history.some(
      (item) => item.password === hashedPassword,
    );
    if (isPasswordReused) {
      throw new BadRequestException('사용한 비밀번호는 재사용할 수 없습니다.');
    }
  }

  async recordPasswordChange(userId: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.prismaService.passwordHistory.create({
      data: {
        userId,
        password: hashedPassword,
      },
    });
  }

  async updateUserPassword(updateUserInput: UpdateUserInput) {
    const user = await this.prismaService.user.findUnique({
      where: { id: updateUserInput.id },
    });
    if (!user) {
      throw new NotFoundException('사용자가 없습니다.');
    }

    const passwordMatch = await bcrypt.compare(
      updateUserInput.oldPassword,
      user.password,
    );
    if (!passwordMatch) {
      throw new BadRequestException('잘못된 이전 비림번호입니다.');
    }

    await this.validatePasswordChange(
      updateUserInput.id,
      updateUserInput.password,
    );
    const hashedPassword = await bcrypt.hash(updateUserInput.password, 12);
    await this.prismaService.user.update({
      where: { id: updateUserInput.id },
      data: { password: hashedPassword },
    });
    await this.recordPasswordChange(
      updateUserInput.id,
      updateUserInput.password,
    );
  }

  async getUser(getUserInput: Prisma.UserWhereUniqueInput) {
    const user = await this.prismaService.user.findUnique({
      where: getUserInput,
    });

    if (!user) {
      throw new NotFoundException('사용자가 없습니다.');
    }
    return user;
  }

  async verifyUser(email: string, password: string) {
    const user = await this.getUser({ email });
    const hashedPassword = await bcrypt.compare(password, user.password);
    if (!hashedPassword) {
      throw new UnauthorizedException('비밀번호가 유효하지 않습니다.');
    }
    return user;
  }

  async verifyUserRefreshToken(refreshToken: string, userId: number) {
    const user = await this.getUser({ id: userId });
    console.log('refreshToken', user);
    const authenticated = await bcrypt.compare(
      refreshToken,
      user.refresh_token,
    );
    if (!authenticated) {
      throw new UnauthorizedException('재발급 토큰이 유효하지 않습니다.');
    }
    return user;
  }

  async createUser(createUserInput: CreateUserInput) {
    const { email, password, passwordConfirmation, phone_number, name } =
      createUserInput;
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('메일이 이미 존재합니다.');
    }
    if (passwordConfirmation && password !== passwordConfirmation) {
      throw new BadRequestException('비밀번호 확인이 일치하지 않습니다.');
    }
    if (!isValidPhoneNumber(phone_number)) {
      throw new BadRequestException('전화번호 양식이 틀립니다');
    }
    const formatter = new AsYouType();
    formatter.input(phone_number);
    const { number, nationalNumber } = formatter.getNumber();
    const regex = /^10-?(\d{4}-?\d{4})$/;
    if (!regex.test(nationalNumber)) {
      throw new BadRequestException(
        '전화번호 형식이 올바르지 않습니다. (010-XXXX-XXXX)',
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const existingUserByPhoneNumber = await this.prismaService.user.findUnique({
      where: { phone_number: number },
    });
    if (existingUserByPhoneNumber) {
      throw new BadRequestException('번호가 존재합니다.');
    }
    const newUser = await this.prismaService.user.create({
      data: {
        email,
        password: passwordHash,
        phone_number: number,
        name,
      },
    });
    this.notificationsService
      .notifyEmail({
        email: newUser.email,
        name: newUser.name,
        subject: '당신에 계정을 활성화 시키세요.',
        templatePath: join(
          __dirname,
          '../../../',
          '/email-templates/activation-mail.ejs',
        ),
        activationCode: '1234',
        text: 'Text1',
        data: { title: 'title', content: 'content' },
      })
      .subscribe(() => {});
    await this.recordPasswordChange(newUser.id, password);
    return newUser;

    // if (phone_number) {
    //   const parseNumber = parsePhoneNumberFromString(phone_number);
    //   if (!parseNumber.isValid()) {
    //     throw new BadRequestException('번호가 유효하지 않습니다.');
    //   }
    //   const existingUserByPhoneNumber =
    //     await this.prismaService.user.findUnique({
    //       where: { phone_number },
    //     });
    //   if (existingUserByPhoneNumber) {
    //     throw new ConflictException('번호가 존재합니다.');
    //   }
    // }
  }

  async getOrCreateUser(data: CreateUserRequestInput) {
    const user = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });
    if (user) {
      return user;
    }
    return this.prismaService.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        phone_number: data.phone_number,
      },
    });
  }

  async getUsers() {
    return this.prismaService.user.findMany();
  }

  async findOne(id: number) {
    return this.prismaService.user.findUnique({
      where: { id: id },
    });
  }

  async updateUser(
    input: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.prismaService.user.update({
      where: input,
      data,
    });
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
