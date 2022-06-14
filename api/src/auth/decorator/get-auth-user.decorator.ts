import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from './../interface/auth-user.interface';

export const GetAuthUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
