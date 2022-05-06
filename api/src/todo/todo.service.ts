import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from '../entities/todo.entity';
import { Repository } from 'typeorm';
import Dayjs from '../util/dayjs';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';
import { diff } from 'just-diff';
import isEmpty from 'just-is-empty';

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

    await this.todoRepository.insert(todo).catch((e) => {
      throw new InternalServerErrorException('データの作成に失敗しました');
    });

    return {
      success: true,
      data: todo as Todo,
    };
  }

  async findAll() {
    return await this.todoRepository
      .find()
      .catch((e) => {
        throw new InternalServerErrorException('一覧の取得に失敗しました');
      })
      .then(function (value) {
        return {
          success: true,
          data: value,
        };
      });
  }

  async findOne(id: number) {
    if (Number.isNaN(id)) {
      throw new NotFoundException('データの取得に失敗しました');
    }

    return await this.todoRepository
      .findOne({
        id: id,
      })
      .catch((e) => {
        throw new InternalServerErrorException('データの取得に失敗しました');
      })
      .then(function (value) {
        if (!value) {
          throw new NotFoundException('データの取得に失敗しました');
        }

        return {
          success: true,
          data: value,
        };
      });
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

    todo.updatedAt = Dayjs().tz().format();

    return await this.todoRepository
      .update(
        {
          id: id,
        },
        todo,
      )
      .catch((e) => {
        throw new InternalServerErrorException('データの更新に失敗しました');
      })
      .then(function (value) {
        change = { ...original.data, ...todo };
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
      });
  }

  async delete(id: number) {
    if (Number.isNaN(id)) {
      throw new NotFoundException('データの取得に失敗しました');
    }
    const original = await this.findOne(id);

    return await this.todoRepository
      .delete({
        id: id,
      })
      .catch((e) => {
        throw new InternalServerErrorException('データの削除に失敗しました');
      })
      .then(function (value) {
        return {
          success: true,
          data: original.data,
        };
      });
  }
}
