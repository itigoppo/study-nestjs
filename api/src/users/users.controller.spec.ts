import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AuthUser } from './../auth/interface/auth-user.interface';
import { User } from './../entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signin', () => {
    it('OK', async () => {
      const params: AuthUser = {
        user: {
          id: 1,
        } as User,
        expires: 12345678,
        expiredAt: '1997-07-07 00:00:00',
      };
      const actual = await controller.getProfile(params);
      expect(actual).toBeDefined();
      expect(actual.user).not.toBeNull();
      expect(actual.expires).not.toBeNull();
      expect(actual.expiredAt).not.toBeNull();
    });
  });
});
