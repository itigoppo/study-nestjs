import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from './../config/auth.service';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../entities/repositories/user.repository';
import { SigninDto } from './auth.dto';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const fakeJwtService = {
      signAsync: () => {
        return 'hashpasswd';
      },
    };
    const fakeUserRepository = {
      validateUser: (id: string, password: string) => {
        return {
          id: 1,
          username: 'test',
          email: 'test@test.example',
          password: '12345678',
        } as User;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          useClass: JwtConfigService,
        }),
      ],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: fakeJwtService,
        },
        {
          provide: UserRepository,
          useValue: fakeUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signin', () => {
    it('OK', async () => {
      const params: SigninDto = {
        id: '1',
        password: 'test',
      };
      const actual = await service.signin(params);
      expect(actual).toBeDefined();
      expect(actual.success).toEqual(true);
      expect(actual.data.access_token).not.toBeNull();
    });
  });
});
