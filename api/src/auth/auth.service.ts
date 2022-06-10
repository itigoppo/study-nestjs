import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../entities/repositories/user.repository';
import { SigninDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly usersRepository: UserRepository,
  ) {}

  async signin(input: SigninDto) {
    const user = await this.usersRepository.validateUser(
      input.id,
      input.password,
    );

    return {
      success: true,
      data: user,
    };
  }
}
