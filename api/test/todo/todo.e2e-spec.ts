import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from './../../src/app.module';
import Dayjs from './../../src/util/dayjs';
import { AllExceptionsFilter } from './../../src/filters/all-exceptions.filter';
import { getConnection } from 'typeorm';
import { todoFactory } from './../factories/todo.factory';

describe('TodoController (e2e)', () => {
  let app: INestApplication;

  // 全テスト開始前に実行する
  beforeAll(async () => {
    // テストに必要なモジュールを作成
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // モジュールからインスタンスを作成
    app = moduleFixture.createNestApplication();

    // DTOによるバリデーションを有効にする
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // 例外フィルターを有効にする
    app.useGlobalFilters(new AllExceptionsFilter());

    // インスタンス初期化
    await app.init();
  });

  // 全テスト開始後に実行する
  afterAll(async () => {
    // インスタンスを閉じる
    await app.close();
  });

  // テスト実行前に実行する
  beforeEach(async () => {
    await todoFactory.create({ title: 'test title' });
  });

  // テスト実行後に実行する
  afterEach(async () => {
    // データクリア
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      const repository = getConnection().getRepository(entity.name);
      await repository.clear();
    }
  });

  /**
   * @summary データを作成する
   * @param bodies
   * @returns request.Response
   */
  const create = async (bodies) => {
    return await request(app.getHttpServer())
      .post('/todo/')
      .set('Accept', 'application/json')
      .send(bodies);
  };

  /**
   * @summary データの一覧を取得する
   * @param page: number
   * @returns request.Response
   */
  const findAll = async (page = null) => {
    let api = '/todo/?orderBy=id&order=ASC';
    if (page) {
      api += '&page=' + page;
    }
    return await request(app.getHttpServer()).get(api);
  };

  /**
   * @summary データを1件取得する
   * @param id: number
   * @returns request.Response
   */
  const findOne = async (id) => {
    return await request(app.getHttpServer()).get('/todo/' + id);
  };

  /**
   * @summary データを更新する
   * @param id: number
   * @param bodies
   * @returns request.Response
   */
  const update = async (id, bodies) => {
    return await request(app.getHttpServer())
      .patch('/todo/' + id)
      .set('Accept', 'application/json')
      .send(bodies);
  };

  /**
   * @summary データを削除する
   * @param id: number
   * @returns request.Response
   */
  const deleteOne = async (id) => {
    return await request(app.getHttpServer()).delete('/todo/' + id);
  };

  describe('作成テスト', () => {
    it('OK /todo (POST)', async () => {
      const res = await create({
        title: 'create test title',
        description: 'create test description',
      });

      const now = Dayjs();
      // ステータスの確認
      expect(res.status).toEqual(201);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(true);
      // 追加されたデータの確認
      expect(res.body.data.id).toEqual(2);
      expect(res.body.data.title).toEqual('create test title');
      expect(res.body.data.description).toEqual('create test description');
      expect(res.body.data.completedAt).toBeNull();
      expect(Dayjs(res.body.data.createdAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
      expect(Dayjs(res.body.data.updatedAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
    });

    it('NG /todo (POST)', async () => {
      let res = await create({
        title: 'create test title over',
        description: 'create test description',
      });
      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual(
        '20文字以下で入力してください',
      );
      res = await create({
        title: 'create test title',
        description: 'create test description ' + '0123456789'.repeat(50),
      });
      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual(
        '500文字以下で入力してください',
      );

      res = await create({
        title: '',
      });
      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual(
        'title should not be empty',
      );
    });
  });

  describe('一覧テスト', () => {
    it('OK /todo (GET)', async () => {
      await todoFactory.createList(20);
      const res = await findAll();

      // ステータスの確認
      expect(res.status).toEqual(200);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(true);
      // レスポンス内のデータの確認
      expect(Array.isArray(res.body.data)).toEqual(true);
      expect(res.body.data.length).toEqual(10);

      // データが取得できていることの確認
      let todo = res.body.data.shift();
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

      todo = res.body.data.shift();
      expect(todo.id).toEqual(2);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(3);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(4);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(5);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(6);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(7);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(8);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(9);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(10);

      const pagination = res.body.pagination;
      expect(pagination.currentPage).toEqual(1);
      expect(pagination.itemCount).toEqual(21);
      expect(pagination.pageCount).toEqual(3);
      expect(pagination.hasPrevPage).toEqual(false);
      expect(pagination.hasNextPage).toEqual(true);
    });

    it('OK /todo?page=middlepage (GET)', async () => {
      await todoFactory.createList(20);
      const res = await findAll(2);

      // ステータスの確認
      expect(res.status).toEqual(200);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(true);
      // レスポンス内のデータの確認
      expect(Array.isArray(res.body.data)).toEqual(true);
      expect(res.body.data.length).toEqual(10);

      // データが取得できていることの確認
      let todo = res.body.data.shift();
      expect(todo.id).toEqual(11);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(12);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(13);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(14);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(15);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(16);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(17);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(18);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(19);
      todo = res.body.data.shift();
      expect(todo.id).toEqual(20);

      const pagination = res.body.pagination;
      expect(pagination.currentPage).toEqual(2);
      expect(pagination.itemCount).toEqual(21);
      expect(pagination.pageCount).toEqual(3);
      expect(pagination.hasPrevPage).toEqual(true);
      expect(pagination.hasNextPage).toEqual(true);
    });

    it('OK /todo?page=lastpage (GET)', async () => {
      await todoFactory.createList(20);
      const res = await findAll(3);

      // ステータスの確認
      expect(res.status).toEqual(200);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(true);
      // レスポンス内のデータの確認
      expect(Array.isArray(res.body.data)).toEqual(true);
      expect(res.body.data.length).toEqual(1);

      // データが取得できていることの確認
      const todo = res.body.data.shift();
      expect(todo.id).toEqual(21);

      const pagination = res.body.pagination;
      expect(pagination.currentPage).toEqual(3);
      expect(pagination.itemCount).toEqual(21);
      expect(pagination.pageCount).toEqual(3);
      expect(pagination.hasPrevPage).toEqual(true);
      expect(pagination.hasNextPage).toEqual(false);
    });

    it('NG(not found) /todo/?page=overpage (GET)', async () => {
      const res = await findAll(2);
      // ステータスの確認
      expect(res.status).toEqual(404);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toEqual('データの取得に失敗しました');
    });
  });

  describe('1件取得テスト', () => {
    it('OK /todo/:id (GET)', async () => {
      const res = await findOne(1);
      // ステータスの確認
      expect(res.status).toEqual(200);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(true);

      // 登録されたデータが取得できていることの確認
      const todo = res.body.data;
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

    it('NG(not found) /todo/:id (GET)', async () => {
      const res = await findOne(99);
      // ステータスの確認
      expect(res.status).toEqual(404);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toEqual('データの取得に失敗しました');
    });

    it('NG(type error) /todo/:id (GET)', async () => {
      const res = await findOne('a');
      // ステータスの確認
      expect(res.status).toEqual(404);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toEqual('データの取得に失敗しました');
    });
  });

  describe('編集テスト', () => {
    it('OK /todo/:id (PATCH)', async () => {
      const res = await update(1, {
        title: 'update test title',
        description: 'update test description',
      });
      // ステータスの確認
      expect(res.status).toEqual(200);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(true);
      // 変更があったか確認
      expect(res.body.isDirty).toEqual(true);
      // 変更があった要素の確認
      expect('title' in res.body.dirty).toEqual(true);
      expect('description' in res.body.dirty).toEqual(true);
      expect('updatedAt' in res.body.dirty).toEqual(true);
      // 変更がない要素の確認
      expect('id' in res.body.dirty).toEqual(false);
      expect('completedAt' in res.body.dirty).toEqual(false);
      expect('createdAt' in res.body.dirty).toEqual(false);
      // 変更されたデータが取得できていることの確認
      const todo = res.body.data;
      expect(todo.title).toEqual('update test title');
      expect(todo.description).toEqual('update test description');
    });

    it('NG(not found) /todo/:id (PATCH)', async () => {
      const res = await update(99, {
        title: 'update test title',
      });
      // ステータスの確認
      expect(res.status).toEqual(404);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toEqual('データの取得に失敗しました');
    });

    it('NG(type error) /todo/:id (PATCH)', async () => {
      const res = await update('aa', {
        title: 'update test title',
      });
      // ステータスの確認
      expect(res.status).toEqual(404);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toEqual('データの取得に失敗しました');
    });

    it('NG(validation error) /todo/:id (PATCH)', async () => {
      let res = await update(1, {
        title: 'update test title over',
      });
      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual(
        '20文字以下で入力してください',
      );

      res = await update(1, {
        title: 'update test title',
        description: 'create test description ' + '0123456789'.repeat(50),
      });
      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual(
        '500文字以下で入力してください',
      );
    });
  });

  describe('削除テスト', () => {
    it('OK /todo/:id (DELETE)', async () => {
      const res = await deleteOne(1);
      // ステータスの確認
      expect(res.status).toEqual(200);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(true);

      // 削除されたので取得できないことの確認
      const findRes = await findOne(1);
      // ステータスの確認
      expect(findRes.status).toEqual(404);
    });

    it('NG(not found) /todo/:id (DELETE)', async () => {
      const res = await deleteOne(99);
      // ステータスの確認
      expect(res.status).toEqual(404);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
    });

    it('NG(type error) /todo/:id (DELETE)', async () => {
      const res = await deleteOne('aa');
      // ステータスの確認
      expect(res.status).toEqual(404);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toEqual('データの取得に失敗しました');
    });
  });
});
