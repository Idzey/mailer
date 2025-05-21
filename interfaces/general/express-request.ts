import { Request } from 'express';
import { UserPayload } from 'src/modules/auth/interfaces/userPayload';

interface RequestWithUser extends Request {
  req: {
    user: UserPayload;
  };
}
export default RequestWithUser;
