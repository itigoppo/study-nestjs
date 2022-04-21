import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from '../entities/todo.entity';
import { Repository } from 'typeorm';
import Dayjs from '../util/dayjs';
import { UpdateTodoDto } from './todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  create(title: string, description: string) {
    const now = Dayjs();
    const todo = new Todo();
    todo.title = title;
    todo.description = description;
    todo.createdAt = now.tz().format();
    todo.updatedAt = now.tz().format();

    return this.todoRepository.insert(todo);
  }

  findAll() {
    return this.todoRepository.find();
  }

  findOne(id: number) {
    return this.todoRepository.findOne({
      id: id,
    });
  }

  update(id: number, todo: UpdateTodoDto) {
    todo.updatedAt = Dayjs().tz().format();

    return this.todoRepository.update(
      {
        id: id,
      },
      todo,
    );
  }

  delete(id: number) {
    return this.todoRepository.delete({
      id: id,
    });
  }
}
