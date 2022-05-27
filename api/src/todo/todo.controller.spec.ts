import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { Todo } from '../entities/todo.entity';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';
import { PaginationDto, PaginationOptionsDto } from './../dtos/pagination.dto';
import Dayjs from '../util/dayjs';

describe('TodoController', () => {
  let controller: TodoController;
  let fakeTodoService: Partial<TodoService>;

  beforeEach(async () => {
    fakeTodoService = {
      create: (todo: CreateTodoDto) => {
        return Promise.resolve({
          success: true,
          data: {
            id: 1,
            title: todo.title,
            description: todo.description,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt,
            completedAt: null,
          } as Todo,
        });
      },
      findAll: (pagination: PaginationOptionsDto) => {
        return Promise.resolve({
          success: true,
          data: [
            {
              id: 1,
              title: 'test title',
              description: null,
              completedAt: null,
              createdAt: '1997-07-07 00:00:00',
              updatedAt: '1997-07-07 00:00:00',
            } as Todo,
            {
              id: 2,
              title: 'test title1',
            } as Todo,
          ],
          pagination: new PaginationDto(21, pagination),
        });
      },
      findOne: (id: number) => {
        return Promise.resolve({
          success: true,
          data: {
            id,
            title: 'test title',
            description: null,
            completedAt: null,
            createdAt: '1997-07-07 00:00:00',
            updatedAt: '1997-07-07 00:00:00',
          } as Todo,
        });
      },
      update: (id: number, todo: UpdateTodoDto) => {
        return Promise.resolve({
          success: true,
          data: {
            id,
            title: todo.title,
            description: todo.description,
            completedAt: null,
            createdAt: '1997-07-07 00:00:00',
            updatedAt: todo.updatedAt,
          } as Todo,
          isDirty: true,
          dirty: {
            title: todo.title,
            description: todo.description,
            updatedAt: todo.updatedAt,
          },
          original: {
            id,
            title: 'test title',
            description: null,
            completedAt: null,
            createdAt: '1997-07-07 00:00:00',
            updatedAt: '1997-07-07 00:00:00',
          } as Todo,
        });
      },
      delete: (id: number) => {
        return Promise.resolve({
          success: true,
          data: {
            id,
            title: 'test title',
          } as Todo,
        });
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: fakeTodoService,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('OK', async () => {
      const now = Dayjs();

      const params: CreateTodoDto = {
        title: 'create test title',
        description: 'create test description',
        createdAt: now.tz().format(),
        updatedAt: now.tz().format(),
      };
      const actual = await controller.create(params);
      expect(actual).toBeDefined();
      expect(actual.success).toEqual(true);

      const todo = actual.data;
      expect(todo.id).toEqual(1);
      expect(todo.title).toEqual('create test title');
      expect(todo.description).toEqual('create test description');
      expect(todo.completedAt).toBeNull();
      expect(Dayjs(todo.createdAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
      expect(Dayjs(todo.updatedAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
    });
  });

  describe('findAll', () => {
    it('OK', async () => {
      const params: PaginationOptionsDto = { limit: 10, page: 1, offset: 0 };
      const actual = await controller.findAll(params);
      expect(actual).toBeDefined();
      expect(actual.success).toEqual(true);
      expect(Array.isArray(actual.data)).toEqual(true);
      expect(actual.data.length).toEqual(2);

      const todo = actual.data.shift();
      expect(todo.id).toEqual(1);
      expect(todo.title).toEqual('test title');
      expect(todo.description).toBeNull();
      expect(todo.completedAt).toBeNull();
      expect(Dayjs(todo.createdAt).format('YYYY-MM-DD HH:mm:ss')).toEqual(
        '1997-07-07 00:00:00',
      );
      expect(Dayjs(todo.updatedAt).format('YYYY-MM-DD HH:mm:ss')).toEqual(
        '1997-07-07 00:00:00',
      );

      const pagination = actual.pagination;
      expect(pagination.currentPage).toEqual(1);
      expect(pagination.itemCount).toEqual(21);
      expect(pagination.pageCount).toEqual(3);
      expect(pagination.hasPrevPage).toEqual(false);
      expect(pagination.hasNextPage).toEqual(true);
    });
  });

  describe('findOne', () => {
    it('OK', async () => {
      const actual = await controller.findOne({ id: '1' });
      expect(actual).toBeDefined();
      expect(actual.success).toEqual(true);

      const todo = actual.data;
      expect(todo.id).toEqual(1);
      expect(todo.title).toEqual('test title');
      expect(todo.description).toBeNull();
      expect(todo.completedAt).toBeNull();
      expect(Dayjs(todo.createdAt).format('YYYY-MM-DD HH:mm:ss')).toEqual(
        '1997-07-07 00:00:00',
      );
      expect(Dayjs(todo.updatedAt).format('YYYY-MM-DD HH:mm:ss')).toEqual(
        '1997-07-07 00:00:00',
      );
    });
  });

  describe('update', () => {
    it('OK', async () => {
      const params: UpdateTodoDto = {
        title: 'update test title',
        description: 'update test description',
        updatedAt: Dayjs().tz().format(),
      };
      const actual = await controller.update({ id: '1' }, params);
      expect(actual).toBeDefined();
      expect(actual.success).toEqual(true);
      // 変更があったか確認
      expect(actual.isDirty).toEqual(true);
      // 変更があった要素の確認
      expect('title' in actual.dirty).toEqual(true);
      expect('description' in actual.dirty).toEqual(true);
      expect('updatedAt' in actual.dirty).toEqual(true);
      // 変更がない要素の確認
      expect('id' in actual.dirty).toEqual(false);
      expect('completedAt' in actual.dirty).toEqual(false);
      expect('createdAt' in actual.dirty).toEqual(false);
      // 変更されたデータが取得できていることの確認
      const todo = actual.data;
      expect(todo.title).toEqual('update test title');
      expect(todo.description).toEqual('update test description');
    });
  });

  describe('delete', () => {
    it('OK', async () => {
      const actual = await controller.delete({ id: '1' });
      expect(actual).toBeDefined();
      expect(actual.success).toEqual(true);
    });
  });
});
