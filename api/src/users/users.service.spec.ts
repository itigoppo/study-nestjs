import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { UserRepository } from '../entities/repositories/user.repository';
import Dayjs from '../util/dayjs';
import { CreateUserDto } from './user.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const items = [];

    const fakeUserRepository = {
      save: (entity: User) => {
        items.push(entity);
        return entity;
      },
      duplicate: (username: string, email: string) => {
        return null;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: fakeUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      const actual = await service.create(params);
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
});
