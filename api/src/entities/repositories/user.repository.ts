import { EntityRepository, IsNull, Repository } from 'typeorm';
import { User } from '../user.entity';
import bcrypt = require('bcrypt');
import { UnauthorizedException } from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async duplicate(username: string, email: string) {
    return this.find({
      where: [{ username }, { email }],
    });
  }

  async validateUser(id: string, password: string) {
    const entity = await this.findOne({
      where: [
        { username: id, deletedAt: IsNull() },
        { email: id, deletedAt: IsNull() },
      ],
    });

    if (entity && (await bcrypt.compare(password, entity.password))) {
      return entity;
    }

    throw new UnauthorizedException('IDまたはパスワードが違います');
  }
}
