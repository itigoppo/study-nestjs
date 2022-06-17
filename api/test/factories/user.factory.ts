import { Factory } from 'typeorm-factory';
import { User } from './../../src/entities/user.entity';

export const usersFactory = new Factory(User)
  .sequence('username', (i: number) => `test${i}`)
  .sequence('email', (i: number) => `test${i}@test.example`)
  .attr('password', '12345678')
  .attr('createdAt', '1997-07-07 00:00:00')
  .attr('updatedAt', '1997-07-07 00:00:00');
