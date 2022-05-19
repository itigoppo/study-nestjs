import { Factory } from 'typeorm-factory';
import { Todo } from './../../src/entities/todo.entity';

export const todoFactory = new Factory(Todo)
  .attr('title', 'test title')
  .attr('createdAt', '1997-07-07 00:00:00')
  .attr('updatedAt', '1997-07-07 00:00:00');
