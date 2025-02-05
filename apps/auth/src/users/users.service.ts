import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserInput, CreateUserOutput } from './dto/create-user.input';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AsYouType, isValidPhoneNumber } from 'libphonenumber-js';
import {
  NOTIFICATIONS_SERVICE_NAME,
  NotificationsServiceClient,
  TokenPayload,
} from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { join } from 'path';
import { CreateUserRequestInput } from './dto/create-user.request.input';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
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

@Injectable()
export class UsersService implements OnModuleInit {
  private notificationsService: NotificationsServiceClient;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(NOTIFICATIONS_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.notificationsService =
      this.client.getService<NotificationsServiceClient>(
        NOTIFICATIONS_SERVICE_NAME,
      );
  }

  async getUser(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자가 없습니다.');
    }
    return user;
  }

  async getMe(user: User) {
    const newUser = await this.prismaService.user.findUnique({
      where: { id: user.id },
    });

    if (!user) {
      throw new NotFoundException('사용자가 없습니다.');
    }
    return newUser;
  }

  async verifyUser(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('사용자가 없습니다.');
    }
    const hashedPassword = await bcrypt.compare(password, user.password);
    if (!hashedPassword) {
      throw new UnauthorizedException('비밀번호가 유효하지 않습니다.');
    }
    return user;
  }

  async verifyUserRefreshToken(refreshToken: string, userId: number) {
    const user = await this.getUser(userId);
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
    return newUser;
  }

  async createUserGql(
    createUserInput: CreateUserInput,
  ): Promise<CreateUserOutput> {
    try {
      const { email, password, passwordConfirmation, phone_number, name } =
        createUserInput;
      const existingUser = await this.prismaService.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return {
          ok: false,
          error: '메일이 이미 존재합니다.',
        };
      }
      if (passwordConfirmation && password !== passwordConfirmation) {
        return {
          ok: false,
          error: '비밀번호 확인이 일치하지 않습니다.',
        };
      }
      if (!isValidPhoneNumber(phone_number)) {
        return {
          ok: false,
          error: '전화번호 양식이 틀립니다,',
        };
      }
      const formatter = new AsYouType();
      formatter.input(phone_number);
      const { number, nationalNumber } = formatter.getNumber();
      const regex = /^10-?(\d{4}-?\d{4})$/;
      if (!regex.test(nationalNumber)) {
        return {
          ok: false,
          error: '전화번호 형식이 올바르지 않습니다. (010-XXXX-XXXX)',
        };
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const existingUserByPhoneNumber =
        await this.prismaService.user.findUnique({
          where: { phone_number: number },
        });
      if (existingUserByPhoneNumber) {
        return {
          ok: false,
          error: '번호가 존재합니다.',
        };
      }
      const newUser = await this.prismaService.user.create({
        data: {
          email,
          password: passwordHash,
          phone_number: number,
          name,
        },
      });
      const token = await this.getTokens(newUser.id);

      await this.updateUser(newUser.id, token.refresh_token);

      const activationCode = await this.createActivationToken(newUser.id);
      const { activation_token, activation_code } = activationCode;
      const verification = await this.prismaService.activation.create({
        data: {
          activation_code: activation_code,
          activation_token: activation_token,
          userId: newUser.id,
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
          activationCode: verification.activation_code,
          text: 'Text1',
          data: { title: 'title', content: 'content' },
        })
        .subscribe(() => {});
      return {
        user: newUser,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        activation_code: verification.activation_code,
        activation_token: verification.activation_token,
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error,
      };
    }
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

  async getUsersGql() {
    return this.prismaService.user.findMany();
  }

  async getUserGql(id: number) {
    return this.prismaService.user.findUnique({
      where: { id: id },
    });
  }

  async updateUser(userId: number, refresh_token: string): Promise<User> {
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        refresh_token: bcrypt.hashSync(refresh_token),
      },
    });
  }

  async updateUserGql(
    id: number,
    updateInput: UpdateInput,
  ): Promise<UpdateOutput> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });
      const updatedUser = await this.prismaService.user.update({
        where: { id: user.id },
        data: { ...updateInput },
      });
      return {
        ok: true,
        user: updatedUser,
      };
    } catch (error) {
      return {
        ok: false,
        error: error,
      };
    }
  }

  async removeUserGql(id: number) {
    return this.prismaService.user.delete({ where: { id } });
  }

  async meGql(userId: number): Promise<MeUserOutput> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return {
          ok: false,
          error: '사용자가 인증이 안 되었습니다.',
        };
      }
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return { ok: false, error: error };
    }
  }

  // create activation code
  async createActivationToken(userId: number) {
    const activation_code = Math.floor(1000 + Math.random() * 9000).toString();
    const activation_token = this.jwtService.sign(
      { id: userId, activation_code },
      {
        secret: this.configService.getOrThrow(
          'AUTH_JWT_ACTIVATION_TOKEN_SECRET',
        ),
        expiresIn: `${this.configService.getOrThrow('AUTH_JWT_ACTIVATION_EXPIRATION')}m`,
      },
    );
    return { activation_token, activation_code };
  }

  // generate access and refresh tokens for the user
  async getTokens(userId: number) {
    const tokenPayload: TokenPayload = { userId };
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
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(tokenPayload, {
        secret: this.configService.getOrThrow('AUTH_JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: `${this.configService.getOrThrow('AUTH_JWT_ACCESS_EXPIRATION')}s`,
        // expiresIn: '30s',
      }),
      this.jwtService.signAsync(tokenPayload, {
        secret: this.configService.getOrThrow('AUTH_JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: `${this.configService.getOrThrow('AUTH_JWT_REFRESH_EXPIRATION')}s`,
        // expiresIn: '15m',
      }),
    ]);
    return { access_token, refresh_token };
  }

  // generate forgot password link
  async generateForgotPasswordLink(userId: number) {
    return this.jwtService.sign(
      { id: userId },
      {
        secret: this.configService.getOrThrow(
          'AUTH_JWT_FORGOT_PASSWORD_TOKEN_SECRET',
        ),
        expiresIn: `${this.configService.getOrThrow('AUTH_JWT_FORGOT_PASSWORD_EXPIRATION')}m`,
      },
    );
  }

  async forgotPasswordGql(
    forgotPasswordInput: ForgotPasswordInput,
  ): Promise<ForgotPasswordOutput> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: forgotPasswordInput.email },
      });
      if (!user) {
        return {
          ok: false,
          error: '사용자를 찾을 수 없습니다.',
          message: null,
        };
      }
      const forgotPasswordToken = await this.generateForgotPasswordLink(
        user.id,
      );
      const resetPasswordUrl =
        this.configService.getOrThrow('AUTH_UI_REDIRECT') +
        `/reset-password?verify=${forgotPasswordToken}`;

      this.notificationsService
        .notifyEmail({
          email: user.email,
          name: user.name,
          subject: '패스워드 초기화.',
          templatePath: join(
            __dirname,
            '../../../',
            '/email-templates/forgot-password.ejs',
          ),
          activationCode: resetPasswordUrl,
          text: 'Text1',
          data: { title: 'title', content: 'content' },
        })
        .subscribe(() => {});
      return {
        ok: true,
        message: '당신에 패스워드 초기화를 성공했씁니다.',
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        error: error,
      };
    }
  }

  async resetPasswordGql(
    resetPasswordInput: ResetPasswordInput,
  ): Promise<ResetPasswordOutput> {
    try {
      const decoded = await this.jwtService.decode(
        resetPasswordInput.activation_code,
      );
      if (!decoded || decoded.exp * 1000 < Date.now()) {
        return {
          ok: false,
          error: '유효하지 않는 토큰입니다.',
        };
      }
      const user = await this.prismaService.user.update({
        where: {
          id: decoded.id,
        },
        data: {
          password: await bcrypt.hash(resetPasswordInput.password, 10),
        },
      });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async verifyEmailGql(
    verifyEmailInput: VerityEmailInput,
  ): Promise<VerityEmailOutput> {
    try {
      console.log('verifyEmailInput', verifyEmailInput);
      const verification = await this.prismaService.activation.findFirst({
        where: { activation_code: verifyEmailInput.activation_code },
      });
      console.log('verification', verification);
      const user = await this.getUser(verification.userId);
      console.log(user);
      const newUser = this.jwtService.verify(verification.activation_token, {
        secret: this.configService.getOrThrow(
          'AUTH_JWT_ACTIVATION_TOKEN_SECRET',
        ),
      });
      console.log('newUser', newUser);
      if (verifyEmailInput.activation_code !== verification.activation_code) {
        return {
          ok: false,
          error: '유효하지 않는 코드입니다.',
        };
      }
      if (newUser && newUser.exp) {
        const expiryDate = new Date(newUser.exp * 1000);
        console.log('expiryDate', expiryDate);
        const now = new Date();
        if (expiryDate < now) {
          await this.prismaService.user.delete({ where: { id: user.id } });
          return { ok: false, error: '토큰이 만료되었씁니다.' };
        }
      }
      if (verification) {
        await this.prismaService.user.update({
          where: { id: verification.userId },
          data: {
            activate: true,
            activation: {
              update: { activation_code: '', activation_token: '' },
            },
          },
        });
        return { ok: true, user };
      }
      return { ok: false, error: '인증을 찾을 수 없습니다.' };
    } catch (error) {
      return { ok: false, error: '인증을 할 수 없습니다.' };
    }
  }

  async resendVerificationCode(
    resendVerificationCodeInput: ResendVerificationCodeInput,
  ): Promise<ResendVerificationCodeOutput> {
    try {
      const newVerification = await this.prismaService.activation.findFirst({
        where: {
          activation_token: resendVerificationCodeInput.activation_token,
        },
      });
      const user = await this.getUser(newVerification.userId);
      const { activation_token, activation_code } =
        await this.createActivationToken(newVerification.userId);

      const verification = await this.prismaService.activation.update({
        where: { id: newVerification.id },
        data: {
          activation_code,
          activation_token: resendVerificationCodeInput.activation_token,
          user: { update: { activate: false } },
        },
      });
      const newUser = await this.jwtService.verify(
        resendVerificationCodeInput.activation_token,
        {
          secret: this.configService.getOrThrow(
            'AUTH_JWT_ACTIVATION_TOKEN_SECRET',
          ),
        },
      );
      this.notificationsService
        .notifyEmail({
          email: user.email,
          name: user.name,
          subject: '당신에 계정을 활성화 시키세요.',
          templatePath: join(
            __dirname,
            '../../../',
            '/email-templates/activation-mail.ejs',
          ),
          activationCode: verification.activation_code,
          text: 'Text1',
          data: { title: 'title', content: 'content' },
        })
        .subscribe(() => {});

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async rememberMeGql() {}
}
