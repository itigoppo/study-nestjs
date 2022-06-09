import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../entities/repositories/user.repository';
import Dayjs from '../util/dayjs';
import { CreateUserDto } from './user.dto';
import isEmpty from 'just-is-empty';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly usersRepository: UserRepository,
  ) {}

  async create(user: CreateUserDto) {
    if (
      !isEmpty(await this.usersRepository.duplicate(user.username, user.email))
    ) {
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
