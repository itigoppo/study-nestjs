import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetAuthUser } from './../auth/decorator/get-auth-user.decorator';
import { AuthUser } from './../auth/interface/auth-user.interface';

@Controller('users')
export class UsersController {
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@GetAuthUser() authUser: AuthUser) {
    return authUser;
  }
}
