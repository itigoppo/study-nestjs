import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import Dayjs from './../../src/util/dayjs';

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
    app.useGlobalPipes(new ValidationPipe());

    // インスタンス初期化
    await app.init();
  });

  // 全テスト開始後に実行する
  afterAll(async () => {
    // インスタンスを閉じる
    await app.close();
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
   * @returns request.Response
   */
  const findAll = async () => {
    return await request(app.getHttpServer()).get('/todo/');
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
      // ステータスの確認
      expect(res.status).toEqual(201);
      // 追加されたIDの確認
      expect(res.body.raw.insertId).toEqual(1);
    });

    it('NG /todo (POST)', async () => {
      let res = await create({
        title: 'create test title over',
        description: 'create test description',
      });
      // ステータスの確認
      expect(res.status).toEqual(400);
      // エラーメッセージの確認
      expect(res.body.message).toContainEqual('20文字以下で入力してください');
      res = await create({
        title: 'create test title',
        description: 'create test description ' + '0123456789'.repeat(50),
      });
      // ステータスの確認
      expect(res.status).toEqual(400);
      // エラーメッセージの確認
      expect(res.body.message).toContainEqual('500文字以下で入力してください');

      res = await create({
        title: '',
      });
      // ステータスの確認
      expect(res.status).toEqual(400);
      // エラーメッセージの確認
      expect(res.body.message).toContainEqual('title should not be empty');
    });
  });

  describe('一覧テスト', () => {
    it('OK /todo (GET)', async () => {
      const now = Dayjs();
      // 取得用データ作成
      const createRes = await create({
        title: 'find all test title',
      });
      const id = createRes.body.raw.insertId;

      const res = await findAll();

      // ステータスの確認
      expect(res.status).toEqual(200);

      // データが取得できていることの確認
      expect(Array.isArray(res.body)).toEqual(true);
      const todo = res.body.pop();
      expect(todo.id).toEqual(id);
      expect(todo.title).toEqual('find all test title');
      expect(todo.description).toBeNull();
      expect(todo.completedAt).toBeNull();
      expect(Dayjs(todo.createdAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
      expect(Dayjs(todo.updatedAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
    });
  });

  describe('1件取得テスト', () => {
    it('OK /todo/:id (GET)', async () => {
      const now = Dayjs();
      // 取得用データ作成
      const createRes = await create({
        title: 'find one test title',
      });
      const id = createRes.body.raw.insertId;

      const res = await findOne(id);
      // ステータスの確認
      expect(res.status).toEqual(200);

      // 登録されたデータが取得できていることの確認
      const todo = res.body;
      expect(todo.id).toEqual(id);
      expect(todo.title).toEqual('find one test title');
      expect(todo.description).toBeNull();
      expect(todo.completedAt).toBeNull();
      expect(Dayjs(todo.createdAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
      expect(Dayjs(todo.updatedAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
    });

    it('NG(not found) /todo/:id (GET)', async () => {
      const res = await findOne(99);
      // ステータスの確認
      expect(res.status).toEqual(404);
    });

    it('NG(type error) /todo/:id (GET)', async () => {
      const res = await findOne('a');
      // ステータスの確認
      expect(res.status).toEqual(500);
    });
  });

  describe('編集テスト', () => {
    it('OK /todo/:id (PATCH)', async () => {
      const now = Dayjs();
      // 編集用データ作成
      const createRes = await create({
        title: 'before test title',
      });
      const createId = createRes.body.raw.insertId;

      const findCreateRes = await findOne(createId);
      const createTodo = findCreateRes.body;

      // 更新日ずらすためにちょっと止める
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(1000);

      const updateRes = await update(createId, {
        title: 'update test title',
        description: 'update test description',
      });
      // ステータスの確認
      expect(updateRes.status).toEqual(200);

      // 登録時とデータが変わっていることの確認
      const res = await findOne(createId);
      const todo = res.body;
      expect(todo.title).not.toEqual(createTodo.title);
      expect(todo.title).toEqual('update test title');
      expect(todo.description).not.toBeNull();
      expect(todo.description).toEqual('update test description');
      expect(todo.createdAt).toEqual(createTodo.createdAt);
      expect(todo.updatedAt).not.toEqual(createTodo.updatedAt);
    });

    it('NG(not found) /todo/:id (PATCH)', async () => {
      const res = await update(99, {
        title: 'update test title',
      });
      // ステータスの確認
      expect(res.status).toEqual(404);
    });

    it('NG(type error) /todo/:id (PATCH)', async () => {
      const res = await update('aa', {
        title: 'update test title',
      });
      // ステータスの確認
      expect(res.status).toEqual(500);
    });

    it('NG(validation error) /todo/:id (PATCH)', async () => {
      // 編集用データ作成
      const createRes = await create({
        title: 'before test title',
      });
      const createId = createRes.body.raw.insertId;

      let res = await update(createId, {
        title: 'update test title over',
      });
      // ステータスの確認
      expect(res.status).toEqual(400);
      // エラーメッセージの確認
      expect(res.body.message).toContainEqual('20文字以下で入力してください');

      res = await update(createId, {
        title: 'update test title',
        description: 'create test description ' + '0123456789'.repeat(50),
      });
      // ステータスの確認
      expect(res.status).toEqual(400);
      // エラーメッセージの確認
      expect(res.body.message).toContainEqual('500文字以下で入力してください');
    });
  });

  describe('削除テスト', () => {
    it('OK /todo/:id (DELETE)', async () => {
      const now = Dayjs();
      // 削除用データ作成
      const createRes = await create({
        title: 'delete test',
      });
      const id = createRes.body.raw.insertId;

      const findCreateRes = await findOne(id);
      // ステータスの確認
      expect(findCreateRes.status).toEqual(200);

      const deleteRes = await deleteOne(id);
      // ステータスの確認
      expect(deleteRes.status).toEqual(200);

      // 削除されたので取得できないことの確認
      const res = await findOne(id);
      // ステータスの確認
      expect(res.status).toEqual(404);
    });

    it('NG(not found) /todo/:id (DELETE)', async () => {
      const res = await deleteOne(99);
      // ステータスの確認
      expect(res.status).toEqual(404);
    });

    it('NG(type error) /todo/:id (DELETE)', async () => {
      const res = await deleteOne('aa');
      // ステータスの確認
      expect(res.status).toEqual(500);
    });
  });
});
