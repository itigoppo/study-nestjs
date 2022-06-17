import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from './../src/app.module';
import Dayjs from './../src/util/dayjs';
import { AllExceptionsFilter } from './../src/filters/all-exceptions.filter';
import { getConnection } from 'typeorm';
import { usersFactory } from './factories/user.factory';

describe('AppController (e2e)', () => {
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
    await usersFactory.create({ username: 'testuser' });
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
  const create = async (bodies: any) => {
    return await request(app.getHttpServer())
      .post('/signup')
      .set('Accept', 'application/json')
      .send(bodies);
  };

  /**
   * @summary トークンを取得する
   * @param bodies
   * @returns request.Response
   */
  const signin = async (bodies: any) => {
    return await request(app.getHttpServer())
      .post('/signin')
      .set('Accept', 'application/json')
      .send(bodies);
  };

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('サインアップテスト', () => {
    it('OK /signup (POST)', async () => {
      const res = await create({
        username: 'createuser',
        email: 'createuser@example.test',
        password: '12345678',
      });

      const now = Dayjs();
      // ステータスの確認
      expect(res.status).toEqual(201);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(true);
      // 追加されたデータの確認
      expect(res.body.data.id).toEqual(2);
      expect(res.body.data.username).toEqual('createuser');
      expect(res.body.data.email).toEqual('createuser@example.test');
      expect(res.body.data.password).not.toEqual('12345678');
      expect(Dayjs(res.body.data.createdAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
      expect(Dayjs(res.body.data.updatedAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
    });

    it('NG /signup (POST)', async () => {
      let res = await create({
        email: 'createuser@example.test',
        password: '12345678',
      });

      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual(
        'username should not be empty',
      );

      res = await create({
        username: 'create user',
        email: 'createuser@example.test',
        password: '12345678',
      });

      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual(
        'username must contain only letters and numbers',
      );

      res = await create({
        username: 'createuseroveroverover',
        email: 'createuser@example.test',
        password: '12345678',
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
        username: 'createuser',
        password: '12345678',
      });

      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual(
        'email should not be empty',
      );

      res = await create({
        username: 'createuser',
        email: 'createuser.example.test',
        password: '12345678',
      });

      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual('email must be an email');

      res = await create({
        username: 'createuser',
        email: 'createuser@example.test',
      });

      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual(
        'password should not be empty',
      );

      res = await create({
        username: 'createuser',
        email: 'createuser@example.test',
        password: '1234 5678',
      });

      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual(
        'password must contain only letters and numbers',
      );

      res = await create({
        username: 'createuser',
        email: 'createuser@example.test',
        password: '1',
      });

      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual(
        '8〜50文字で入力してください',
      );
    });
  });

  describe('サインインテスト', () => {
    it('OK /signin (POST)', async () => {
      const res = await signin({
        id: 'testuser',
        password: '12345678',
      });

      // ステータスの確認
      expect(res.status).toEqual(201);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(true);
      // 追加されたデータの確認
      expect(res.body.data.access_token).not.toBeNull();
    });

    it('NG /signin (POST)', async () => {
      let res = await signin({
        id: 'testuser',
        password: '12345',
      });

      // ステータスの確認
      expect(res.status).toEqual(401);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toEqual('IDまたはパスワードが違います');

      res = await signin({
        password: '12345678',
      });

      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual('id should not be empty');

      res = await signin({
        id: 'testuser',
      });

      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual(
        'password should not be empty',
      );

      await usersFactory.create({
        username: 'deteleuser',
        deletedAt: '1997-07-07 00:00:00',
      });

      res = await signin({
        id: 'deteleuser',
        password: '12345678',
      });

      // ステータスの確認
      expect(res.status).toEqual(401);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toEqual('IDまたはパスワードが違います');
    });
  });
});
