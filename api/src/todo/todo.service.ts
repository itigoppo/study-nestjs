import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from '../entities/todo.entity';
import { Repository } from 'typeorm';
import Dayjs from '../util/dayjs';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';
import { diff } from 'just-diff';
import isEmpty from 'just-is-empty';
import { PaginationDto, PaginationOptionsDto } from './../dtos/pagination.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  async create(todo: CreateTodoDto) {
    const now = Dayjs();
    todo.createdAt = now.tz().format();
    todo.updatedAt = now.tz().format();
    await this.todoRepository.save(todo);

    return {
      success: true,
      data: todo as Todo,
    };
  }

  async findAll(pagination: PaginationOptionsDto) {
    const queryBuilder = this.todoRepository.createQueryBuilder('todo');

    queryBuilder
      .orderBy('todo.' + pagination.orderBy, pagination.order)
      .take(pagination.limit)
      .skip(pagination.offset);
    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    if (isEmpty(entities)) {
      throw new NotFoundException('データの取得に失敗しました');
    }

    return {
      success: true,
      data: entities,
      pagination: new PaginationDto(itemCount, pagination),
    };
  }

  async findOne(id: number) {
    if (Number.isNaN(id)) {
      throw new NotFoundException('データの取得に失敗しました');
    }

    const entity = await this.todoRepository.findOne({
      id: id,
    });

    if (!entity) {
      throw new NotFoundException('データの取得に失敗しました');
    }

    return {
      success: true,
      data: entity,
    };
  }

  async update(id: number, todo: UpdateTodoDto) {
    if (Number.isNaN(id)) {
      throw new NotFoundException('データの取得に失敗しました');
    }
    const original = await this.findOne(id);
    let change = { ...original.data, ...todo };

    if (isEmpty(diff(change, original.data))) {
      return {
        success: true,
        data: change as Todo,
        isDirty: false,
        dirty: {},
        original: original.data,
      };
    }
    change.updatedAt = Dayjs().tz().format();

    await this.todoRepository.save(change);
    const diffData = diff(original.data, change);

    const dirties = {};
    for (const element of diffData) {
      if (element.op === 'replace') {
        dirties[element.path[0]] = element.value;
      }
    }

    return {
      success: true,
      data: change as Todo,
      isDirty: !isEmpty(diffData),
      dirty: dirties,
      original: original.data,
    };
  }

  async delete(id: number) {
    if (Number.isNaN(id)) {
      throw new NotFoundException('データの取得に失敗しました');
    }
    const original = await this.findOne(id);
    const todo = await this.todoRepository.remove(original.data);

    return {
      success: true,
      data: todo,
    };
  }
}
