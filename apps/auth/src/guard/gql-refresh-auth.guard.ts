import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

@Injectable()
export class GqlRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  getRequest(context: ExecutionContext): Promise<any> {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  // canActivate(
  //   context: ExecutionContext,
  // ): boolean | Promise<boolean> | Observable<boolean> {
  //   const ctx = GqlExecutionContext.create(context);
  //   const request = ctx.getContext().req;
  //   const refreshToken = request.cookies?.Refresh;
  //   if (!refreshToken) {
  //     throw new UnauthorizedException('Refresh token not found.');
  //   }
  //   return super.canActivate(context);
  // }
}
