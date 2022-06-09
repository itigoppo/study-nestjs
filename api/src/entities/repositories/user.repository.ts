import { EntityRepository, Repository } from 'typeorm';
import { User } from '../user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async duplicate(username: string, email: string) {
    return this.find({
      where: [{ username }, { email }],
    });
  }
}
