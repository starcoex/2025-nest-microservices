import { app } from './app';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@app/common';
import { lastValueFrom } from 'rxjs';
import {
  CanActivate,
  Inject,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';

export class authContext implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_PACKAGE_NAME) private readonly client: ClientGrpc) {}
  onModuleInit() {
    this.authService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }
  private getServiceClient() {
    // console.log(this.authService);

    return (this.authService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME));
  }
}

// export const authContext = async ({ req }) => {
//   try {
//     const authClient = app.get<ClientGrpc>(AUTH_PACKAGE_NAME);
//
//     const result = authClient.getService(AUTH_SERVICE_NAME);
//     console.log('result', result);
//     // console.log('authContext', authClient);
//     // const user = await lastValueFrom(
//     //   authClient.send('authenticate', {
//     //     Authentication: req.headers?.authentication,
//     //   }),
//     // );
//     // return { user };
//   } catch (err) {
//     throw new UnauthorizedException(err);
//   }
// };
