import { User } from './../../entities/user.entity';

export interface AuthUser {
  user: User;
  expires: number;
  expiredAt: string;
}
