import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { Todo } from '../entities/todo.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';
import { PaginationOptionsDto } from './../dtos/pagination.dto';
import Dayjs from '../util/dayjs';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(async () => {
    const items = [
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
    ];

    const fakeTodoRepository = {
      save: (entity: Todo) => {
        items.push(entity);
      },
      createQueryBuilder: jest.fn(() => ({
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(items.length),
        getRawAndEntities: jest.fn().mockResolvedValue({
          entities: items,
        }),
      })),
      findOne: () => items[0],
      update: (id: number, entity: Todo) => entity,
      remove: () => items.splice(0, 1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useValue: fakeTodoRepository,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      const actual = await service.create(params);
      expect(actual.success).toEqual(true);

      const todo = actual.data;
      expect(todo.title).toEqual('create test title');
      expect(todo.description).toEqual('create test description');
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
      const actual = await service.findAll(params);

      expect(actual.success).toEqual(true);
      expect(Array.isArray(actual.data)).toEqual(true);
      expect(actual.data.length).toEqual(2);

      const todo = actual.data.shift();
      expect(todo.id).toEqual(1);
      expect(todo.title).toEqual('test title');

      const pagination = actual.pagination;
      expect(pagination.currentPage).toEqual(1);
      expect(pagination.itemCount).toEqual(2);
      expect(pagination.pageCount).toEqual(1);
      expect(pagination.hasPrevPage).toEqual(false);
      expect(pagination.hasNextPage).toEqual(false);
    });
  });

  describe('findOne', () => {
    it('OK', async () => {
      const actual = await service.findOne(1);

      expect(actual.success).toEqual(true);
      const todo = actual.data;
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
      const actual = await service.update(1, params);

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
      const actual = await service.delete(1);
      expect(actual).toBeDefined();
      expect(actual.success).toEqual(true);
    });
  });
});
