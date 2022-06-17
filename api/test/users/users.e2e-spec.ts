import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from './../../src/app.module';
import { AllExceptionsFilter } from './../../src/filters/all-exceptions.filter';
import { getConnection } from 'typeorm';
import { usersFactory } from './../factories/user.factory';

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

  /**
   * @summary データを削除する
   * @param token: string
   * @returns request.Response
   */
  const profile = async (token) => {
    return await request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', 'Bearer ' + token);
  };

  describe('認証テスト', () => {
    it('OK /users/profile (GET)', async () => {
      const accessToken = await signin({
        id: 'testuser',
        password: '12345678',
      });

      const res = await profile(accessToken.body.data.access_token);
      // ステータスの確認
      expect(res.status).toEqual(200);
      // レスポンス内のデータの確認
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toEqual(1);
      expect(res.body.user.username).toEqual('testuser');
      expect(res.body.user.email).toEqual('test1@test.example');
      expect(res.body.expires).not.toBeNull();
      expect(res.body.expiredAt).not.toBeNull();
    });

    it('NG /users/profile (GET)', async () => {
      const res = await profile('');
      // ステータスの確認
      expect(res.status).toEqual(401);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false);
      // エラーメッセージの確認
      expect(res.body.error.message).toEqual('Unauthorized');
    });
  });
});
