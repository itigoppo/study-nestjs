import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/database.service';
import { TodoModule } from './todo/todo.module';
import { UsersModule } from './users/users.module';
import { UserRepository } from './entities/repositories/user.repository';
import { UsersService } from './users/users.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from './config/auth.service';

let envFilePath = './src/config/.env';
if (process.env.NODE_ENV) {
  envFilePath = './src/config/.env.' + process.env.NODE_ENV;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [envFilePath],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserRepository]),
    TodoModule,
    UsersModule,
    AuthModule,
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, UsersService, AuthService],
})
export class AppModule {}
