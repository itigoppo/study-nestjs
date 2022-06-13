import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../entities/repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from './../config/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
  ],
  providers: [AuthService],
})
export class AuthModule {}
