# step1: はろーNestJS

- Nestプロジェクトを作る

apiコンテナにはいってプロジェクト作成

```shell
docker-compose exec api sh
nest new .
```

コンテナ内ではカレントディレクトリ、ホスト側では./apiの中にできる

- サーバーの起動

```shell
docker-compose exec api sh
npm run start:dev
```

http://localhost:3000/

にアクセスしてはろーわーるど！ヨシ！

# step2: MySQLと繋いで見る

- TypeORMを導入する

```shell
docker-compose exec api sh
npm install --save @nestjs/typeorm typeorm mysql2
```

- TypeORMの設定ファイルを作る

/api/ormconfig.jsonを以下で作成する


```json
{
  "type": "mysql",
  "host": "db",
  "port": 3306,
  "username": "root",
  "password": "root",
  "database": "study",
  "entities": [
    "dist/entities/**/*.entity.js"
  ],
  "migrations": [
    "dist/migrations/**/*.js"
  ],
  "logging": true,
  "synchronize": true
}
```

- TypeORMをモジュールとして登録する

/api/src/app.module.tsを以下で編集する

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from "@nestjs/typeorm"; // 追加

@Module({
  imports: [
    TypeOrmModule.forRoot(), // 追加
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

- entityの作成

/api/src/entities/todo.entity.tsを以下で作成する

PK用のIDとタイトルと本文とあとはタイムスタンプセットのカラムをセットしておきます

```ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ length: 100 })
  title: string;

  @Column('text')
  description: string;

  @Column('datetime', { name: 'completed_at', precision: 0, default: null })
  completedAt: string | null = null;

  @Column('datetime', {
    name: 'created_at',
    precision: 0,
    default: null,
    nullable: false,
  })
  createdAt: string | null = null;

  @Column('datetime', {
    name: 'updated_at',
    precision: 0,
    default: null,
    nullable: false,
  })
  updatedAt: string | null = null;
}
```

- マイグレーションを作成する

entityからマイグレーションを作ってくれるのでビルドしてどん！

```shell
docker-compose exec api sh
npm run build
npx typeorm migration:generate -d src/migrations -n create-todo
```

/api/src/migrations/
にマイグレーションファイルが作成されてるので確認する

- マイグレーションを実行する

/api/src/migrations/
にあるマイグレーションファイルを実行してくれるのでビルドしてどん！

```shell
docker-compose exec api sh
npm run build
npx typeorm migration:run
```
- テーブルの確認をする

一旦apiコンテナからでてdbコンテナに入ってmysqlにログイン

```shell
docker-compose exec db sh
mysql -uroot -p
# enter password: root
```

```mysql
USE study;
SHOW TABLES;

# mysql> show tables;
# +-----------------+
# | Tables_in_study |
# +-----------------+
# | migrations      |
# | todo            |
# +-----------------+
# 2 rows in set (0.00 sec)

SHOW COLUMNS FROM `todo`;

# +--------------+--------------+------+-----+---------+----------------+
# | Field        | Type         | Null | Key | Default | Extra          |
# +--------------+--------------+------+-----+---------+----------------+
# | id           | int          | NO   | PRI | NULL    | auto_increment |
# | title        | varchar(100) | NO   |     | NULL    |                |
# | description  | text         | NO   |     | NULL    |                |
# | completed_at | datetime     | YES  |     | NULL    |                |
# | created_at   | datetime     | NO   |     | NULL    |                |
# | updated_at   | datetime     | NO   |     | NULL    |                |
# +--------------+--------------+------+-----+---------+----------------+
# 6 rows in set (0.00 sec)
```

todoテーブル確認ヨシ！

※マイグレーションの実行管理テーブルmigrationsテーブルもできます

# step3: コードのフォーマットを自動でする

プロジェクトをつくったときにPrettierの実行コマンドがformatで登録されているのでそれを叩きます

```shell
docker-compose exec api sh
npm run format
```

諸々正された、、、ヨシ！

# step4: エラーチェックしてみる

プロジェクトをつくったときにESLintの実行コマンドがlintで登録されているのでそれを叩きます

/api/src/main.tsのasyncをsyncなどとミスらせて、どん！

```shell
docker-compose exec api sh
npm run lint

# > api@0.0.1 lint
# > eslint "{src,apps,libs,test}/**/*.ts" --fix
#
#
# /api/src/main.ts
#   4:0  error  Parsing error: Unknown keyword or identifier. Did you mean 'async'?
#
# ✖ 1 problem (1 error, 0 warnings)
```

怒られた！ヨシ！

/api/src/main.ts戻しておきます

# step5: CRUDする準備

- モジュール、コントローラ、サービスのひな形作成

```shell
docker-compose exec api sh
npx nest g mo todo
# CREATE src/todo/todo.module.ts (81 bytes)
# UPDATE src/app.module.ts (382 bytes)

npx nest g co todo
# CREATE src/todo/todo.controller.spec.ts (478 bytes)
# CREATE src/todo/todo.controller.ts (97 bytes)
# UPDATE src/todo/todo.module.ts (166 bytes)

npx nest g s todo
# CREATE src/todo/todo.service.spec.ts (446 bytes)
# CREATE src/todo/todo.service.ts (88 bytes)
# UPDATE src/todo/todo.module.ts (240 bytes)
```

- リポジトリの実装と登録

/api/src/todo/todo.module.tsを以下で編集する

```ts
import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TypeOrmModule } from '@nestjs/typeorm'; // 追加
import { Todo } from '../entities/todo.entity'; // 追加

@Module({
  imports: [TypeOrmModule.forFeature([Todo])], // 追加
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
```

/api/src/todo/todo.service.tsを以下で編集する

雛形だといないのでまるっとコンストラクタを実装する形

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from '../entities/todo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}
}
```

# step6: CURDのC!…の前に日付操作周りの調整

- Day.jsを導入する

```shell
docker-compose exec api sh
npm install --save dayjs
```

- 日本時間を共通設定にする

/api/src/util/dayjs.tsを以下で作成する

```ts
import * as dayjs from 'dayjs';

import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

// 日本時間に変換する
import 'dayjs/locale/ja';

// プラグイン拡張
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');
dayjs.locale('ja');

export default dayjs;
```

# step7: CURDのC!!!

- インサートメソッドを実装する

/api/src/todo/todo.service.tsにインサートするメソッドを作る

タイトルと本文を引数として受け取ってタイムスタンプをいれてTypeORMのinsert()を呼ぶだけ

```ts
import Dayjs from '../util/dayjs';

export class TodoService {
  // ...省略
  create(title: string, description: string) {
    const now = Dayjs();
    const todo = new Todo();
    todo.title = title;
    todo.description = description;
    todo.createdAt = now.tz().format();
    todo.updatedAt = now.tz().format();

    return this.todoRepository.insert(todo);
  }
}
```

- アクションを実装する

/api/src/todo/todo.controller.tsにアクションを実装する

```ts
import { Body, Controller, Post } from '@nestjs/common';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
  constructor(private readonly service: TodoService) {}

  @Post()
  async create(@Body() bodies: { title: string; description: string }) {
    return await this.service.create(bodies.title, bodies.description);
  }
}

```

- アクセスしてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:dev
```

ターミナルでPOSTアクセス

```shell
curl http://localhost:3000/todo -X POST -d "title=最初のTODO&description=後で書く"

{"identifiers":[{"id":1}],"generatedMaps":[{"id":1,"completedAt":null,"createdAt":"2022-04-21T08:07:58.000Z","updatedAt":"2022-04-21T08:07:58.000Z"}],"raw":{"fieldCount":0,"affectedRows":1,"insertId":1,"info":"","serverStatus":2,"warningStatus":0}}%
```

- データを確認

dbコンテナにはいってmysqlにログイン

```mysql
SELECT * FROM todo;

# +----+----------------+--------------+--------------+---------------------+---------------------+
# | id | title          | description  | completed_at | created_at          | updated_at          |
# +----+----------------+--------------+--------------+---------------------+---------------------+
# |  1 | 最初のTODO     | 後で書く     | NULL         | 2022-04-21 17:07:58 | 2022-04-21 17:07:58 |
# |  2 | 2つ目のTODO    | 後で書く     | NULL         | 2022-04-21 17:11:41 | 2022-04-21 17:11:41 |
# |  3 | 3つ目のTODO    | 後で書く     | NULL         | 2022-04-21 17:11:50 | 2022-04-21 17:11:50 |
# +----+----------------+--------------+--------------+---------------------+---------------------+
# 3 rows in set (0.00 sec)
```

データ入ってるね！ヨシ！

# step8: CURDのR!!!

- 全件取得するメソッドを実装する


/api/src/todo/todo.service.tsに全件取得するメソッドを作る

TypeORMのfind()を呼ぶだけ

```ts
export class TodoService {
  // ...省略
  findAll() {
    return this.todoRepository.find();
  }
}
```
- アクションを実装する

/api/src/todo/todo.controller.tsにアクションを実装する

```ts
import { Body, Controller, Get, Post } from '@nestjs/common'; // Getを追加
export class TodoController {
  // ...省略
  @Get()
  async findAll() {
    return await this.service.findAll();
  }
}
```

- アクセスしてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:dev
```

http://localhost:3000/todo にブラウザでアクセス

以下のように登録データが返ってきたらヨシ！

```json
[
  {
    "completedAt": null,
    "createdAt": "2022-04-21T08:07:58.000Z",
    "updatedAt": "2022-04-21T08:07:58.000Z",
    "id": 1,
    "title": "最初のTODO",
    "description": "後で書く"
  },
  {
    "completedAt": null,
    "createdAt": "2022-04-21T08:11:41.000Z",
    "updatedAt": "2022-04-21T08:11:41.000Z",
    "id": 2,
    "title": "2つ目のTODO",
    "description": "後で書く"
  },
  {
    "completedAt": null,
    "createdAt": "2022-04-21T08:11:50.000Z",
    "updatedAt": "2022-04-21T08:11:50.000Z",
    "id": 3,
    "title": "3つ目のTODO",
    "description": "後で書く"
  }
]
```

# step9: 1件だけ取得する

- 1件取得するメソッドを実装する

/api/src/todo/todo.service.tsに1件取得するメソッドを作る

1件なのでTypeORMのfind()ではなくfindOne()を呼ぶ

```ts
export class TodoService {
  // ...省略
  findOne(id: number) {
    return this.todoRepository.findOne({
      id: id,
    });
  }
}
```

- アクションを実装する

/api/src/todo/todo.controller.tsにアクションを実装する

```ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common'; // Paramを追加
export class TodoController {
  // ...省略
  @Get(':id')
  async findOne(@Param() params: { id: string }) {
    return await this.service.findOne(Number(params.id));
  }
}
```

- アクセスしてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:dev
```

http://localhost:3000/todo/1 にブラウザでアクセス

以下のように登録データが返ってきたらヨシ！

```json
{
  "completedAt": null,
  "createdAt": "2022-04-21T08:07:58.000Z",
  "updatedAt": "2022-04-21T08:07:58.000Z",
  "id": 1,
  "title": "最初のTODO",
  "description": "後で書く"
}
```

# step10: 存在しないidにアクセスされたらエラーにする

http://localhost:3000/todo/100 (存在しないid)にブラウザでアクセスすると空データが返ってくるのでこれをエラーにしたい

/api/src/todo/todo.controller.tsのアクションを変更する

```ts
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common'; // HttpException, HttpStatusを追加
export class TodoController {
  // ...省略
  @Get(':id')
  async findOne(@Param() params: { id: string }) {
    const todo = await this.service.findOne(Number(params.id));
    if (!todo) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Missing item(id: ' + params.id + ').',
        },
        404,
      );
    }

    return todo;
  }
}
```

http://localhost:3000/todo/100 にブラウザでアクセス

以下のように登録データが返ってきたらヨシ！

```json
{
  "status": 404,
  "error": "Missing item(id: 100)."
}
```

# step11: CURDのU!!!

- 更新メソッドを実装する

/api/src/todo/todo.service.tsに更新するメソッドを作る

TypeORMのupdate()を呼ぶ

```ts
export class TodoService {
  // ...省略
  update(id: number, title: string, description: string) {
    return this.todoRepository.update(
      {
        id: id,
      },
      {
        title: title,
        description: description,
        updatedAt: Dayjs().tz().format(),
      },
    );
  }
}
```

- アクションを実装する

/api/src/todo/todo.controller.tsにアクションを実装する

```ts
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common'; // Patchを追加

export class TodoController {
  // ...省略
  @Patch(':id')
  async update(
    @Param() params: { id: string },
    @Body() bodies: { title: string; description: string },
  ) {
    const todo = await this.service.findOne(Number(params.id));
    if (!todo) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Missing item(id: ' + params.id + ').',
        },
        404,
      );
    }

    return await this.service.update(
      Number(params.id),
      bodies.title,
      bodies.description,
    );
  }
}
```

- アクセスしてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:dev
```

ターミナルでPATCHアクセス

```shell
curl http://localhost:3000/todo/1 -X PATCH -d "title=1つ目のTODO&description=後で書く"

# {"generatedMaps":[],"raw":[],"affected":1}%
```

http://localhost:3000/todo/1 にブラウザでアクセス

titleが変更されてupdatedAtも更新されてるのが確認できたらヨシ！

```json
{
  "completedAt": null,
  "createdAt": "2022-04-21T08:07:58.000Z",
  "updatedAt": "2022-04-21T09:32:41.000Z",
  "id": 1,
  "title": "1つ目のTODO",
  "description": "後で書く"
}
```
