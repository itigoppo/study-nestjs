import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './../../entities/repositories/user.repository';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './../interface/jwt-payload.interface';
import { AuthUser } from './../interface/auth-user.interface';
import { IsNull } from 'typeorm';
import Dayjs from './../../util/dayjs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {
    const configService = new ConfigService();

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const entity = await this.userRepository.findOne({
      id: payload.id,
      username: payload.username,
      deletedAt: IsNull(),
    });

    if (!entity) {
      throw new UnauthorizedException();
    }

    return {
      user: entity,
      expires: payload.exp,
      expiredAt: Dayjs.unix(payload.exp).tz().format(),
    };
  }
}
