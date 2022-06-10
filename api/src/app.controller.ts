import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/user.dto';
import { AuthService } from './auth/auth.service';
import { SigninDto } from './auth/auth.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/signup')
  async create(@Body() bodies: CreateUserDto) {
    return await this.usersService.create(bodies);
  }

  @Post('/signin')
  async signin(@Body() bodies: SigninDto) {
    return await this.authService.signin(bodies);
  }
}
