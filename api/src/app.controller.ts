import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/user.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/signup')
  async create(@Body() bodies: CreateUserDto) {
    return await this.usersService.create(bodies);
  }
}
