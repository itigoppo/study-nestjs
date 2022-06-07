import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import Dayjs from '../util/dayjs';
import { CreateUserDto } from './user.dto';
import isEmpty from 'just-is-empty';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(user: CreateUserDto) {
    const duplicateEntities = await this.usersRepository.find({
      where: [{ username: user.username }, { email: user.email }],
    });

    if (!isEmpty(duplicateEntities)) {
      throw new ConflictException('登録済みです');
    }

    const now = Dayjs();
    user.createdAt = now.tz().format();
    user.updatedAt = now.tz().format();
    const entity = await this.usersRepository.save(user);
    entity.password = null;

    return {
      success: true,
      data: entity,
    };
  }
}
