import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import RequestWithUser from 'interfaces/general/express-request';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
