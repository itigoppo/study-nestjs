import { Factory } from 'typeorm-factory';
import { Todo } from './../../src/entities/todo.entity';

export const todoFactory = new Factory(Todo)
  .sequence('title', (i: number) => `test title${i}`)
  .attr('createdAt', '1997-07-07 00:00:00')
  .attr('updatedAt', '1997-07-07 00:00:00');
