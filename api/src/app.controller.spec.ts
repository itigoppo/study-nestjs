import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './entities/repositories/user.repository';
import Dayjs from './util/dayjs';
import { CreateUserDto } from './users/user.dto';
import { User } from './entities/user.entity';
import { SigninDto } from './auth/auth.dto';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const fakeUsersService = {
      create: (user: CreateUserDto) => {
        return Promise.resolve({
          success: true,
          data: {
            id: 1,
            username: user.username,
            email: user.email,
            password: null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          } as User,
        });
      },
    };
    const fakeAuthService = {
      signin: (user: SigninDto) => {
        return Promise.resolve({
          success: true,
          data: {
            access_token: 'hashpasswd',
          },
        });
      },
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        JwtService,
        UserRepository,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('create', () => {
    it('OK', async () => {
      const now = Dayjs();

      const params: CreateUserDto = {
        username: 'test',
        email: 'test@test.example',
        password: '12345678',
        createdAt: now.tz().format(),
        updatedAt: now.tz().format(),
      };
      const actual = await appController.create(params);
      expect(actual.success).toEqual(true);

      const user = actual.data;
      expect(user.username).toEqual('test');
      expect(user.email).toEqual('test@test.example');
      expect(user.password).toBeNull();
      expect(Dayjs(user.createdAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
      expect(Dayjs(user.updatedAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
    });
  });

  describe('signin', () => {
    it('OK', async () => {
      const params: SigninDto = {
        id: '1',
        password: 'test',
      };
      const actual = await appController.signin(params);
      expect(actual).toBeDefined();
      expect(actual.success).toEqual(true);
      expect(actual.data.access_token).not.toBeNull();
    });
  });
});
