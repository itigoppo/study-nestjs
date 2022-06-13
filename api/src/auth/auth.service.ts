import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../entities/repositories/user.repository';
import { SigninDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly usersRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signin(input: SigninDto) {
    const user = await this.usersRepository.validateUser(
      input.id,
      input.password,
    );

    const payload: JwtPayload = { id: user.id, username: user.username };

    return {
      success: true,
      data: {
        access_token: await this.jwtService.signAsync(payload),
      },
    };
  }
}
