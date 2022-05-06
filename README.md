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

# step12: CURDのD!!!

- 削除メソッドを実装する

/api/src/todo/todo.service.tsに削除するメソッドを作る

TypeORMのdelete()を呼ぶ

```ts
export class TodoService {
  // ...省略
  delete(id: number) {
    return this.todoRepository.delete({
      id: id,
    });
  }
}
```

- アクションを実装する

/api/src/todo/todo.controller.tsにアクションを実装する

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common'; // Deleteを追加

export class TodoController {
  // ...省略
  @Delete(':id')
  async delete(@Param() params: { id: string }) {
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

    return await this.service.delete(Number(params.id));
  }
}
```

- アクセスしてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:dev
```

ターミナルでDELETEアクセス

```shell
curl http://localhost:3000/todo/2 -X DELETE

# {"raw":[],"affected":1}%
```

http://localhost:3000/todo にブラウザでアクセス

以下のように登録データが返ってきたらヨシ！

```json
[
  {
    "completedAt": null,
    "createdAt": "2022-04-21T08:07:58.000Z",
    "updatedAt": "2022-04-21T09:32:41.000Z",
    "id": 1,
    "title": "1つ目のTODO",
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

# step13: 編集用バリデーションをつける

- 必要なパッケージをインストール

```shell
docker-compose exec api sh
npm install --save class-transformer class-validator
```

- DTOでバリデーション設定

/api/src/todo/todo.dto.tsを以下で作成する

```ts
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateTodoDto {
  // 指定がなくてもOK
  @IsOptional()
  // string型指定
  @IsString()
  // 20文字以内
  @Length(1, 20, { message: '$constraint2文字以下で入力してください' })
  title: string;

  // 指定がなくてもOK
  @IsOptional()
  // string型指定
  @IsString()
  // 500文字以内
  @Length(1, 500, { message: '$constraint2文字以下で入力してください' })
  description: string;

  // 指定がなくてもOK
  @IsOptional()
  updatedAt: string;
}
```

- DTOによるバリデーションを有効にする

/api/src/main.tsを以下で編集する

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 追加

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // 追加
  await app.listen(3000);
}
bootstrap();

```

/api/src/todo/todo.controller.tsのアクションを変更する

```ts
import { UpdateTodoDto } from './todo.dto';
export class TodoController {
  // ...省略
  @Patch(':id')
  async update(@Param() params: { id: string }, @Body() bodies: UpdateTodoDto) {
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

    return await this.service.update(Number(params.id), bodies);
  }
}
```

/api/src/todo/todo.service.tsの更新するメソッドを編集する

```ts
import { UpdateTodoDto } from './todo.dto';
export class TodoService {
  // ...省略
  update(id: number, todo: UpdateTodoDto) {
    todo.updatedAt = Dayjs().tz().format();

    return this.todoRepository.update(
      {
        id: id,
      },
      todo,
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
curl http://localhost:3000/todo/1 -X PATCH -d "title=123456789012345678901"

```

※descriptionの指定はなくてもいいので飛ばしてtitleを文字数オーバーで飛ばします

```json
{
  "statusCode": 400,
  "message": [
    "20文字以下で入力してください"
  ],
  "error": "Bad Request"
}
```

怒られた！ヨシ！

# step14: 本文の必須を外す

- entityの編集

/api/src/entities/todo.entity.tsを以下で編集する

```ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ length: 100 })
  title: string;

  @Column('text', { nullable: true }) // オプションにnullable: trueを追加
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

- migrationを作成&実行

entityを変更するとそれに合わせてマイグレーションファイルを作ってくれるのでそのまま実行しちゃう

```shell
docker-compose exec api sh
npm run build
npx typeorm migration:generate -d src/migrations -n modified-todo
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

SHOW COLUMNS FROM `todo`;

# +--------------+--------------+------+-----+---------+----------------+
# | Field        | Type         | Null | Key | Default | Extra          |
# +--------------+--------------+------+-----+---------+----------------+
# | id           | int          | NO   | PRI | NULL    | auto_increment |
# | title        | varchar(100) | NO   |     | NULL    |                |
# | description  | text         | YES  |     | NULL    |                |
# | completed_at | datetime     | YES  |     | NULL    |                |
# | created_at   | datetime     | NO   |     | NULL    |                |
# | updated_at   | datetime     | NO   |     | NULL    |                |
# +--------------+--------------+------+-----+---------+----------------+
# 6 rows in set (0.00 sec)
```

descriptionのNullがYESに変わってるヨシ！

- 作成時のデータ受け取りもDTOに変えちゃう

/api/src/todo/todo.dto.tsを以下で編集する

```ts
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'; // IsNotEmpty追加
export class UpdateTodoDto {
  // ...省略
}

export class CreateTodoDto {
  // 必須
  @IsNotEmpty()
  // string型指定
  @IsString()
  // 20文字以内
  @Length(1, 20, { message: '$constraint2文字以下で入力してください' })
  title: string;

  // 指定がなくてもOK
  @IsOptional()
  // string型指定
  @IsString()
  // 500文字以内
  @Length(1, 500, { message: '$constraint2文字以下で入力してください' })
  description: string;

  // 指定がなくてもOK
  @IsOptional()
  createdAt: string;

  // 指定がなくてもOK
  @IsOptional()
  updatedAt: string;
}
```

/api/src/todo/todo.controller.tsのアクションを変更する

```ts
import { CreateTodoDto, UpdateTodoDto } from './todo.dto'; // CreateTodoDto追加
export class TodoController {
  // ...省略
  @Post()
  async create(@Body() bodies: CreateTodoDto) {
    return await this.service.create(bodies);
  }
}
```

/api/src/todo/todo.service.tsのインサートするメソッドを編集する

```ts
import { CreateTodoDto, UpdateTodoDto } from './todo.dto'; // CreateTodoDto追加
export class TodoService {
  // ...省略
  create(todo: CreateTodoDto) {
    const now = Dayjs();
    todo.createdAt = now.tz().format();
    todo.updatedAt = now.tz().format();

    return this.todoRepository.insert(todo);
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
curl http://localhost:3000/todo -X POST -d "title=4つ目のTODO"

// {"identifiers":[{"id":5}],"generatedMaps":[{"id":5,"completedAt":null,"createdAt":"2022-04-22T03:30:39.000Z","updatedAt":"2022-04-22T03:30:39.000Z"}],"raw":{"fieldCount":0,"affectedRows":1,"insertId":5,"info":"","serverStatus":2,"warningStatus":0}}%
```

http://localhost:3000/todo にブラウザでアクセス

以下のように登録データが返ってきたらヨシ！

```json
[
  {
    "completedAt": null,
    "createdAt": "2022-04-21T08:07:58.000Z",
    "updatedAt": "2022-04-21T09:32:41.000Z",
    "id": 1,
    "title": "1つ目のTODO",
    "description": "後で書く"
  },
  {
    "completedAt": null,
    "createdAt": "2022-04-21T08:11:50.000Z",
    "updatedAt": "2022-04-21T08:11:50.000Z",
    "id": 3,
    "title": "3つ目のTODO",
    "description": "後で書く"
  },
  {
    "completedAt": null,
    "createdAt": "2022-04-22T03:30:39.000Z",
    "updatedAt": "2022-04-22T03:30:39.000Z",
    "id": 5,
    "title": "4つ目のTODO",
    "description": null
  }
]
```

ちなみにtitle指定をとると、、、。

```shell
curl http://localhost:3000/todo -X POST -d "description=5つ目のTODO"
```

```json
{
  "statusCode": 400,
  "message": [
    "20文字以下で入力してください",
    "title must be a string",
    "title should not be empty"
  ],
  "error": "Bad Request"
}
```

怒られた！ヨシ！

# step15: DBの設定を環境変数を使うように変える

- .envを作成する

/api/src/config/.envを以下で作成する

```text
DB_HOST=db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=study
```

※設定ファイル周りまとめておきたいのでルート直下にいれてません

- Configを導入する

```shell
docker-compose exec api sh
npm install --save @nestjs/config
```

/api/src/app.module.tsを以下で編集する

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; // 追加
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [
    // ↓追加
    ConfigModule.forRoot({
      envFilePath: ['./src/config/.env'],
    }),
    // ↑追加
    TypeOrmModule.forRoot(),
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

- 設定ファイルを置き換える

/api/src/config/database.service.tsを以下で作成する

```ts
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const configService = new ConfigService();
    return {
      type: 'mysql' as const,
      host: configService.get<string>('DB_HOST'),
      port: parseInt(configService.get<string>('DB_PORT'), 3306),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_DATABASE'),
      entities: ['dist/entities/**/*.entity.js'],
      migrations: ['dist/migrations/**/*.js'],
      logging: true,
      synchronize: true,
      cli: {
        entitiesDir: './src/**',
        migrationsDir: './src/migrations',
      },
    };
  }
}
```

要らなくなるので/api/ormconfig.jsonを削除

/api/src/app.module.tsを以下で編集する

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigService追加
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/database.service'; // 追加
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['./src/config/.env'],
    }),
    // ↓変更
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
      inject: [ConfigService],
    }),
    // ↑変更
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- アクセスしてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:dev
```

http://localhost:3000/todo にブラウザでアクセス

登録データが返ってきたらヨシ！

- migrationも環境変数見てほしい

今のままだとmigrationコマンド実行時にみる設定ファイルが消えたままなのでごねごねします

/api/src/config/migration.tsを以下で作成する

```ts
const dotenv = require('dotenv');
dotenv.config({ path: './src/config/.env' });

import { TypeOrmConfigService } from './database.service';
export default new TypeOrmConfigService().createTypeOrmOptions();
```

公式ドキュメント通りにやったらルート直下にない.envを読まなかったので無理やり突破

- コマンドを登録しておく

/api/package.jsonを以下で編集する

```json
{
  // ...省略
  "scripts": {
    // ...省略
    "typeorm": "npx ts-node ./node_modules/.bin/typeorm -f ./src/config/migration", // 追加
    "migrations:run": "npm run build && npm run typeorm migration:run", // 追加
    "migrations:rollback": "npm run typeorm migration:revert", // 追加
    "migrations:show": "npm run typeorm migration:show", // 追加
    "migration": "npm run build && npm run typeorm migration:generate -- -d src/migrations -n " // 追加
  },
  // ...省略
}
```

ビルドもついでにしちゃったほうが楽かなって

```shell
// ビルド＆ファイル作成
npm run migration [ファイル名]
// ビルド＆実行
npm run migrations:run
// もとに戻す
npm run migrations:rollback
// 状況確認
npm run migrations:show
```

コマンド叩いてみて動けばヨシ！

# step16: HMR環境にする

※メモ：npm run start:devが全更新なのに対して部分更新にする的なやつ

- webpackを導入する

```shell
docker-compose exec api sh
npm install --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin @types/webpack-env
```

- webpackの設定

/api/webpack.config.jsを以下で作成する

```js
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new RunScriptWebpackPlugin({ name: 'server.js' }),
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
  },
};
```

- HMRを有効にする

/api/src/main.tsを以下で編集する

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
  // ↓追加
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  // ↑追加
}
bootstrap();
```

- TypeORMで接続できないらしいのでentiyの呼び方を変える

/api/src/config/database.config.tsを以下で編集する

```ts
import { getMetadataArgsStorage } from 'typeorm'; // 追加

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const configService = new ConfigService();
    return {
      // ...省略
      entities: getMetadataArgsStorage().tables.map((tbl) => tbl.target), //変更
      // ...省略
    };
  }
}

```

- コマンドを登録しておく

/api/package.jsonを以下で編集する

```json
{
  // ...省略
  "scripts": {
    // ...省略
    "start:webpack": "webpack --config webpack.config.js --watch" // 追加
  },
  // ...省略
}
```

- 動かしてみる

まずは起動して

```shell
docker-compose exec api sh
npm run start:webpack
```

/api/src/app.service.tsのはろーわーるど部分でも変更してみる

- なんか怒ってる

```shell
ERROR [TypeOrmModule] Unable to connect to the database. Retrying (9)...
AlreadyHasActiveConnectionError: Cannot create a new connection named "default", because connection with such name already exist and it now has an active connection session.
    at AlreadyHasActiveConnectionError.TypeORMError [as constructor] (/api/node_modules/typeorm/error/TypeORMError.js:9:28)
```

/api/src/config/database.config.tsを以下で編集する

```ts
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const configService = new ConfigService();
    return {
      // ...省略
      cli: {
        entitiesDir: './src/**',
        migrationsDir: './src/migrations',
      },
      keepConnectionAlive: true, //追加
    };
  }
}
```

```shell
...
webpack 5.72.0 compiled successfully in 665 ms
```

怒られずにビルドされてサーバー起動もされてるのでブラウザでアクセスできることみれたらヨシ！

# step17: そうだテストしよう

- はろーわーるど用テストがあるので叩いてみる

```shell
docker-compose exec api sh
npm run test:e2e

# > api@0.0.1 test:e2e
# > jest --config ./test/jest-e2e.json
#
#  PASS  test/app.e2e-spec.ts (57.626 s)
#   AppController (e2e)
#     ✓ / (GET) (3814 ms)
#
# Test Suites: 1 passed, 1 total
# Tests:       1 passed, 1 total
# Snapshots:   0 total
# Time:        59.311 s
# Ran all test suites.
# Jest did not exit one second after the test run has completed.
#
# This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
```

むむむ？テスト自体成功してるけどなんか終われなかったって言って止まってしまってる

- とりあえずテスト用のDB設定と切り替えられるようにする

テスト用のDBをまずつくります(今回はtest-studyとしてつくった)

/api/src/config/.env.testを以下で作成する

```text
DB_HOST=db
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=test-study
```

環境変数で読み込みファイルかえるので/api/src/config/.envを/api/src/config/.env.developmentにリネームする

※docker側でNODE_ENVをdevelopmentで仕込んだので

/api/src/app.module.tsを以下で編集する

```ts
// ↓追加
let envFilePath = './src/config/.env';
if (process.env.NODE_ENV) {
  envFilePath = './src/config/.env.' + process.env.NODE_ENV;
}
// ↑追加

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [envFilePath], // 変更
    }),
    // ...省略
  ],
})
export class AppModule {}

```

/api/src/config/migration.tsを以下で編集する

```ts
// ↓追加
let envFilePath = './src/config/.env';
if (process.env.NODE_ENV) {
  envFilePath = './src/config/.env.' + process.env.NODE_ENV;
}
// ↑追加

const dotenv = require('dotenv');
dotenv.config({ path: envFilePath });

import { TypeOrmConfigService } from './database.service';
export default new TypeOrmConfigService().createTypeOrmOptions();
```

- docker側でdevelopmentに設定したのでテスト実行時はtestにしたい

```shell
docker-compose exec api sh
npm install --save-dev cross-env
```

/api/package.jsonを以下で編集する

```json
{
  // ...省略
  "scripts": {
    // ...省略
    "test:e2e": "cross-env NODE_ENV=test jest --config ./test/jest-e2e.json" // 変更
  },
  // ...省略
}
```

- テスト用DBを見てるか確認する

```shell
docker-compose exec api sh
npm run test:e2e
```

TypeORMの設定でSQLログONにしてるのでテスト実行時にtest-studyみにいってるログが流れてるのが確認できたらヨシ！

- API側に影響出てないことを確認する

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:webpack
```

http://localhost:3000/todo にブラウザでアクセス

登録データが返ってきたらヨシ！

- 実行完了しない問題をなんとかする

倒すのはこれ

```shell
# Jest did not exit one second after the test run has completed.
#
# This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
```

/api/src/config/database.service.tsを以下で編集する

```ts

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const configService = new ConfigService();
    return {
      // ...省略
      keepConnectionAlive:
        configService.get<string>('NODE_ENV') === 'test' ? false : true, // 変更
      // ...省略
    };
  }
}

```

/api/test/app.e2e-spec.tsを以下で編集する

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // ↓追加
  afterAll(async () => {
    await app.close();
  });
  // ↑追加

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

```

```shell
docker-compose exec api sh
npm run test:e2e

# > api@0.0.1 test:e2e
# > cross-env NODE_ENV=test jest --config ./test/jest-e2e.json
#
#  PASS  test/app.e2e-spec.ts (32.87 s)
#   AppController (e2e)
#     ✓ / (GET) (2459 ms)
#
# Test Suites: 1 passed, 1 total
# Tests:       1 passed, 1 total
# Snapshots:   0 total
# Time:        33.62 s, estimated 41 s
# Ran all test suites.
```

実行完了した！ヨシ！

# step18: CRUDでつくったTODOにテストを作ろう

- テストのときはエンティティからテーブル作ってもらう

モックにするとかあるんだろうけどせっかくDB繋いだりしたので実際にデータ入ったり取れたりするテストにします

/api/src/config/database.service.tsを以下で編集する

```ts

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const configService = new ConfigService();
    return {
      // ...省略
      synchronize:
        configService.get<string>('NODE_ENV') === 'test' ? true : false, // 変更
      // ↓追加
      dropSchema:
        configService.get<string>('NODE_ENV') === 'test' ? true : false,
      // ↑追加
      // ...省略
    };
  }
}

```

- テストの雛形作成

/api/test/todo/todo.e2e-spec.tsを以下で作成する

/api/test/app.e2e-spec.tsをまるっとさくっとコピー

https://docs.nestjs.com/fundamentals/testing#end-to-end-testing

ドキュメントみたらbeforeEachじゃなくてbeforeAll使ってるのでそこだけ変更

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

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

    // インスタンス初期化
    await app.init();
  });

  // 全テスト開始後に実行する
  afterAll(async () => {
    // インスタンスを閉じる
    await app.close();
  });
});

```

- 作成機能のテスト

```ts
import { INestApplication, ValidationPipe } from '@nestjs/common'; // ValidationPipeを追加

describe('TodoController (e2e)', () => {
  // 全テスト開始前に実行する
  beforeAll(async () => {
    // ...省略
    // モジュールからインスタンスを作成
    app = moduleFixture.createNestApplication();

    // DTOによるバリデーションを有効にする
    app.useGlobalPipes(new ValidationPipe()); // 追加

    // インスタンス初期化
    await app.init();
  });

  // ...省略
  // ↓追加
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
  // ↑追加
});
```

テストにするとレスポンスがイマイチなことがわかるねHAHAHA

実行時のログにテスト内容を表示するのに/api/test/jest-e2e.jsonを以下で編集する

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "verbose": true // 追加
}
```

```shell
docker-compose exec api sh
npm run test:e2e

# > api@0.0.1 test:e2e
# > cross-env NODE_ENV=test jest --config ./test/jest-e2e.json
#
#  PASS  test/todo/todo.e2e-spec.ts (36.557 s)
#   TodoController (e2e)
#     作成テスト
#       ✓ OK /todo (POST) (164 ms)
#       ✓ NG /todo (POST) (18 ms)
#
#  PASS  test/app.e2e-spec.ts (10.543 s)
#   AppController (e2e)
#     ✓ / (GET) (1752 ms)
#
# Test Suites: 2 passed, 2 total
# Tests:       3 passed, 3 total
# Snapshots:   0 total
# Time:        48.369 s, estimated 49 s
# Ran all test suites.
```

describe()やらit()で書いたのが出てきたのが見えたらヨシ！

- 一覧取得機能のテスト

```ts
describe('TodoController (e2e)', () => {
  // ...省略

  /**
   * @summary データの一覧を取得する
   * @returns request.Response
   */
  const findAll = async () => {
    return await request(app.getHttpServer()).get('/todo/');
  };

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
});
```

時間はタイムゾーンがUTCで返ってきちゃうのでフォーマットし直して比較

一覧はとくにエラーになるような処理いれてないので正常テストのみ

そんなことより取得テストのためにデータ作成してるの良くないねHAHAHA

- 1件取得機能のテスト

```ts
describe('TodoController (e2e)', () => {
  // ...省略
  /**
   * @summary データを1件取得する
   * @param id: number
   * @returns request.Response
   */
  const findOne = async (id) => {
    return await request(app.getHttpServer()).get('/todo/' + id);
  };

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
});
```

データの日付が現在かどうかとかやるなら作成機能側でテストにしたいなぁ、、、

タイプエラーは単にSQLが不正になってシステムエラーはいてるだけだからその手前で弾いたほうがいい気がするなぁ、、、

- 編集機能のテスト

```ts
describe('TodoController (e2e)', () => {
  // ...省略
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

});
```

＿人人人人人人人人人＿

＞　ちょっと止める　＜

￣Y^Y^Y^Y^Y^Y^Y^Y^Y^￣

- 削除機能のテスト

```ts
describe('TodoController (e2e)', () => {
  // ...省略
  /**
   * @summary データを削除する
   * @param id: number
   * @returns request.Response
   */
  const deleteOne = async (id) => {
    return await request(app.getHttpServer()).delete('/todo/' + id);
  };

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
```

言いたいことは多々あったけど一通りかけたのでヨシ！

# step19: 例外のレスポンスを整える

- 例外フィルターを作成する

/api/src/filters/http-exception.filter.tsを以下で作成する

```ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Dayjs from '../util/dayjs';

export interface ErrorResponse {
  success: boolean;
  timestamp: string;
  method: string;
  path: string;
  error: {
    name: string;
    message: Object | string;
  };
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const errorResponse: ErrorResponse = {
      success: false,
      timestamp: Dayjs().tz().format(),
      method: request.method,
      path: request.url,
      error: {
        name: exceptionResponse['error']
          ? exceptionResponse['error']
          : exceptionResponse,
        message: exceptionResponse['message']
          ? exceptionResponse['message']
          : exception.message,
      },
    };

    response.status(status).json(errorResponse);
  }
}

```

- 例外のフィルターを有効にする

/api/src/main.tsを以下で編集する

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter'; // 追加

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter()); // 追加
  await app.listen(3000);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

```

- 怒られてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:webpack
```

ターミナルで不正にアクセス

```shell
curl http://localhost:3000/todo/1 -X PATCH -d "title=123456789012345678901"
```

```json
{
  "success": false,
  "timestamp": "2022-05-04T18:14:28+09:00",
  "method": "PATCH",
  "path": "/todo/2",
  "error": {
    "name": "Bad Request",
    "message": [
      "20文字以下で入力してください"
    ]
  }
}
```

整ったヨシ！

- テストを修正する

/api/test/todo/todo.e2e-spec.tsを以下で編集する

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import Dayjs from './../../src/util/dayjs';
import { HttpExceptionFilter } from './../../src/filters/http-exception.filter'; // 追加

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

    // 例外フィルターを有効にする
    app.useGlobalFilters(new HttpExceptionFilter()); // 追加

    // インスタンス初期化
    await app.init();
  });

  // ...省略

  describe('作成テスト', () => {
    // ...省略
    it('NG /todo (POST)', async () => {
      // ...省略
      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false); // 追加
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual( // res.body.message→res.body.error.message変更
        '500文字以下で入力してください',
      );

      // ...省略
      // ステータスの確認
      expect(res.status).toEqual(400);
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false); // 追加
      // エラーメッセージの確認
      expect(res.body.error.message).toContainEqual( // res.body.message→res.body.error.message変更
        'title should not be empty',
      );
    });
  });
});
```

NG(type error)以外のエラーを同じように書き換え

NG(type error)はHttpExceptionではなくTypeORMErrorなので今回作ったフィルターではキャッチしきれないのでこの時点では変わらない

```shell
docker-compose exec api sh
npm run test:e2e
```

テストを実行して通ったらヨシ！

# step20: TypeORMErrorのレスポンスも整えたい

- 例外フィルターを作成する

/api/src/filters/all-exceptions.filter.tsを以下で作成する

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TypeORMError } from 'typeorm';
import Dayjs from '../util/dayjs';

export interface ErrorResponse {
  success: boolean;
  timestamp: string;
  method: string;
  path: string;
  error: {
    code: string;
    name: string;
    message: Object | string;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse: ErrorResponse = {
      success: false,
      timestamp: Dayjs().tz().format(),
      method: request.method,
      path: request.url,
      error: {
        code: 'UnknownException',
        name: 'error',
        message: 'Something Went Wrong',
      },
    };

    if (exception instanceof HttpException) {
      status = (exception as HttpException).getStatus();
      const exceptionResponse = (exception as HttpException).getResponse();

      errorResponse.error.code = 'HttpException';
      errorResponse.error.name = exceptionResponse['error']
        ? exceptionResponse['error']
        : exceptionResponse;
      errorResponse.error.message = exceptionResponse['message']
        ? exceptionResponse['message']
        : exception.message;
    } else if (exception instanceof TypeORMError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      errorResponse.error.code = (exception as any).code;
      errorResponse.error.name = (exception as any).message;
      errorResponse.error.message = (exception as any).sql;
    }

    response.status(status).json(errorResponse);
  }
}

```

- 例外のフィルターを有効にする

/api/src/main.tsを以下で編集する

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter'; // 削除
import { AllExceptionsFilter } from './filters/all-exceptions.filter'; // 追加

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter()); // 削除
  app.useGlobalFilters(new AllExceptionsFilter()); // 追加
  await app.listen(3000);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

```

- 怒られてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:webpack
```

ターミナルで不正にアクセス

```shell
curl http://localhost:3000/todo/1 -X PATCH -d "title=123456789012345678901"
```

```json
{
  "success": false,
  "timestamp": "2022-05-04T18:14:28+09:00",
  "method": "PATCH",
  "path": "/todo/2",
  "error": {
    "code": "HttpException",
    "name": "Bad Request",
    "message": [
      "20文字以下で入力してください"
    ]
  }
}
```

問題なしヨシ！

次はSQLエラーになる方

```shell
curl http://localhost:3000/todo/aa -X GET
```

```json
{
  "success": false,
  "timestamp": "2022-05-06T11:22:31+09:00",
  "method": "GET",
  "path": "/todo/aaa",
  "error": {
    "code": "ER_BAD_FIELD_ERROR",
    "name": "Unknown column 'NaN' in 'where clause'",
    "message": "SELECT `Todo`.`id` AS `Todo_id`, `Todo`.`title` AS `Todo_title`, `Todo`.`description` AS `Todo_description`, `Todo`.`completed_at` AS `Todo_completed_at`, `Todo`.`created_at` AS `Todo_created_at`, `Todo`.`updated_at` AS `Todo_updated_at` FROM `todo` `Todo` WHERE `Todo`.`id` = NaN LIMIT 1"
  }
}
```

整ったヨシ！

- テストを修正する

/api/test/todo/todo.e2e-spec.tsを以下で編集する


```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import Dayjs from './../../src/util/dayjs';
import { HttpExceptionFilter } from './../../src/filters/http-exception.filter'; // 削除
import { AllExceptionsFilter } from './../../src/filters/all-exceptions.filter'; // 追加

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

    // 例外フィルターを有効にする
    app.useGlobalFilters(new HttpExceptionFilter()); // 削除
    app.useGlobalFilters(new AllExceptionsFilter()); // 追加

    // インスタンス初期化
    await app.init();
  });

  // ...省略

  describe('1件取得テスト', () => {
    // ...省略
    it('NG(type error) /todo/:id (GET)', async () => {
      const res = await findOne('a');
      // ステータスの確認
      expect(res.status).toEqual(422); // 500→422変更
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(false); //追加
      // SQLエラーコードの確認
      expect(res.body.error.code).toEqual('ER_BAD_FIELD_ERROR'); // 追加
    });
  });
});
```

NG(type error)のエラーを同じように書き換え

```shell
docker-compose exec api sh
npm run test:e2e
```

テストを実行してキレイに通ったらヨシ！

# step21: 正常系のレスポンスを整える

- 作成機能のレスポンスを整える

/api/src/todo/todo.service.tsのインサートするメソッドを編集する

作成されたエンティティの中身返すようにしたのとなんらかエラー起きたらエラーキャッチするように変更

```ts
import { Injectable, InternalServerErrorException } from '@nestjs/common'; // InternalServerErrorException追加
export class TodoService {
  // ...省略
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
}
```

- アクセスしてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:webpack
```

ターミナルでPOSTアクセス

```shell
curl http://localhost:3000/todo -X POST -d "title=5つ目のTODO"
```

```json
{
  "success": true,
  "data": {
    "title": "5つ目のTODO",
    "createdAt": "2022-05-06T04:50:30.000Z",
    "updatedAt": "2022-05-06T04:50:30.000Z",
    "id": 14,
    "completedAt": null
  }
}
```

- テストを修正する

/api/test/todo/todo.e2e-spec.tsを以下で編集する

```ts
describe('TodoController (e2e)', () => {
  let app: INestApplication;

  // ...省略

  describe('作成テスト', () => {
    // ...省略
    it('OK /todo (POST)', async () => {
      const res = await create({
        title: 'create test title',
        description: 'create test description',
      });

      const now = Dayjs(); // 追加
      // ステータスの確認
      expect(res.status).toEqual(201);
      // 追加されたIDの確認
      expect(res.body.raw.insertId).toEqual(1); // 削除
      // ↓追加
      // レスポンス内の成否の確認
      expect(res.body.success).toEqual(true);
      // 追加されたデータの確認
      expect(res.body.data.id).toEqual(1);
      expect(res.body.data.title).toEqual('create test title');
      expect(res.body.data.description).toEqual('create test description');
      expect(res.body.data.completedAt).toBeNull();
      expect(Dayjs(res.body.data.createdAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
      expect(Dayjs(res.body.data.updatedAt).format('YYYY-MM-DD')).toEqual(
        now.format('YYYY-MM-DD'),
      );
      // ↑追加
    });
  });
});
```

作成テストが自分で作ったデータの確認できるようになったよやったね

- 一覧取得機能のレスポンスを整える

/api/src/todo/todo.service.tsの一覧取得メソッドを編集する

ここはTypeORMから受け取ったままでそんなに困ってなかったので他とフォーマットを合わせるだけの変更

```ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'; // NotFoundException追加
export class TodoService {
  // ...省略
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
}
```

- アクセスしてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:webpack
```

http://localhost:3000/todo にブラウザでアクセス

以下のように登録データが返ってきたらヨシ！

```json
{
  "success": true,
  "data": [
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
    }
  ]
}
```

- テストを修正する

/api/test/todo/todo.e2e-spec.tsを以下で編集する

```ts
describe('一覧テスト', () => {
  it('OK /todo (GET)', async () => {
    // 取得用データ作成
    const createRes = await create({
      title: 'find all test title',
    });
    const id = createRes.body.data.id; // createRes.body.raw.insertId→createRes.body.data.id変更

    const res = await findAll();

    const now = Dayjs();
    // ステータスの確認
    expect(res.status).toEqual(200);
    // レスポンス内の成否の確認
    expect(res.body.success).toEqual(true); // 追加
    // レスポンス内のデータの確認
    expect(Array.isArray(res.body.data)).toEqual(true); // res.body→res.body.data変更

    // データが取得できていることの確認
    const todo = res.body.data.pop(); // res.body→res.body.data変更
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
```

ここはまだ特になんにも整わないね

- 一件取得機能のレスポンスを整える

/api/src/todo/todo.service.tsの一件取得メソッドを編集する

一覧と同じくレスポンスとしてはTypeORMから受け取ったままでそんなに困ってなかったので他とフォーマットを合わせるだけの変更

ただNumber()に通してNaNにされたものはSQLに通す前にそもそも不正なので先に弾き飛ばすように

```ts
export class TodoService {
  // ...省略
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
}
```

/api/src/todo/todo.controller.tsのアクションを変更する

Serviceでデータが取れなかったときの対処をしたからController側は不要になったのでまるっと削除

```ts
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
npm run start:webpack
```

http://localhost:3000/todo/1 にブラウザでアクセス

以下のように登録データが返ってきたらヨシ！

```json
{
  "success": true,
  "data": {
    "completedAt": null,
    "createdAt": "2022-04-21T08:07:58.000Z",
    "updatedAt": "2022-04-21T08:07:58.000Z",
    "id": 1,
    "title": "最初のTODO",
    "description": "後で書く"
  }
}
```

- テストを修正する

/api/test/todo/todo.e2e-spec.tsを以下で編集する

```ts
describe('1件取得テスト', () => {
  it('OK /todo/:id (GET)', async () => {
    // 取得用データ作成
    const createRes = await create({
      title: 'find one test title',
    });
    const id = createRes.body.data.id; // createRes.body.raw.insertId→createRes.body.data.id変更

    const res = await findOne(id);

    const now = Dayjs();
    // ステータスの確認
    expect(res.status).toEqual(200);
    // レスポンス内の成否の確認
    expect(res.body.success).toEqual(true); // 追加

    // 登録されたデータが取得できていることの確認
    const todo = res.body.data; // res.body→res.body.data変更
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

  // ...省略
  it('NG(type error) /todo/:id (GET)', async () => {
    const res = await findOne('a');
    // ステータスの確認
    expect(res.status).toEqual(404); // 422→404変更
    // レスポンス内の成否の確認
    expect(res.body.success).toEqual(false); //追加
  });
});
```

正常分はここもまだ特になんにも整わないね

- 編集機能のレスポンスを整える

/api/src/todo/todo.service.tsの一件取得メソッドを編集する

変更されたエンティティの中身返すように、変更前も返すように

あとできれば変更されたかどうかも判断したいしそもそも変更ないなら更新しないでほしい

オブジェクトの差分とったりオブジェクトが空か確認したりしたかったのでライブラリを入れる

```shell
docker-compose exec api sh
npm install --save just-diff
npm install --save just-is-empty
```

@link https://github.com/angus-c/just/#just-diff

@link https://github.com/angus-c/just/#just-is-empty

```ts
import { diff } from 'just-diff'; // 追加
import isEmpty from 'just-is-empty'; // 追加
export class TodoService {
  // ...省略
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
}
```

/api/src/todo/todo.controller.tsのアクションを変更する

Serviceでデータが取れなかったときの対処をした(実際したのはfindOne)からController側は不要になったのでまるっと削除

```ts
export class TodoController {
  // ...省略
  @Patch(':id')
  async update(@Param() params: { id: string }, @Body() bodies: UpdateTodoDto) {
    return await this.service.update(Number(params.id), bodies);
  }
}
```

- アクセスしてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:webpack
```

ターミナルでPATCHアクセス
```shell
curl http://localhost:3000/todo/1 -X PATCH -d "title=1つ目のTODO!&description=後で消す"
```

```json
{
  "success": false,
  "timestamp": "2022-05-06T15:44:39+09:00",
  "method": "PATCH",
  "path": "/todo/1",
  "error": {
      "code": "UnknownException",
      "name": "error",
      "message": "Something Went Wrong"
  }
}
```

なーんかエラー出てるけど握りつぶしててわからんぴ

- フィルターでコンソールに全部出るように変える

/api/src/filters/all-exceptions.filter.tsを以下で編集する

```ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // ...省略
    if (exception instanceof HttpException) {
      // ...省略
    } else if (exception instanceof TypeORMError) {
      // ...省略
    } else {
      console.log(exception); // 追加
    }

    response.status(status).json(errorResponse);
  }
}

```

想定してないやつは一旦エクセプション自体をコンソールに出力する

- 改めてエラー対策

```shell
TypeError: (0 , just_is_empty_1.default) is not a function
    at TodoService.update (webpack://api/./src/todo/todo.service.ts?:79:41)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
    at async TodoController.update (webpack://api/./src/todo/todo.controller.ts?:33:16)
    at async /api/node_modules/@nestjs/core/router/router-execution-context.js:46:28
    at async /api/node_modules/@nestjs/core/router/router-proxy.js:9:17
```

/api/tsconfig.jsonに以下を追加する

```json
"esModuleInterop": true
```

@link https://code-log.hatenablog.com/entry/2019/08/31/105535

```shell
src/util/dayjs.ts:3:1
  3 import * as timezone from 'dayjs/plugin/timezone';
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Type originates at this import. A namespace-style import cannot be called or constructed, and will cause a failure at runtime. Consider using a default import or import require here instead.
```

今度はなんだ、、、

@link https://qiita.com/karak/items/29ff148788f5abb15331

> 関数や class を export するモジュールを import する場合、import * as _ from '_' のかわりに import _ = require('_') を使う。

なるほど

/api/src/util/dayjs.tsを以下で編集する


```ts
import * as dayjs from 'dayjs'; // 削除
import * as utc from 'dayjs/plugin/utc'; // 削除
import * as timezone from 'dayjs/plugin/timezone'; // 削除
import dayjs = require('dayjs'); // 追加
import utc = require('dayjs/plugin/utc'); // 追加
import timezone = require('dayjs/plugin/timezone'); // 追加
```

- 改めてアクセスしてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:webpack
```

ターミナルでPATCHアクセス
```shell
curl http://localhost:3000/todo/1 -X PATCH -d "title=1つ目のTODO!&description=後で消す"
```

以下のように登録データが返ってきたらヨシ！

```json

{
  "success": true,
  "data": {
    "completedAt": null,
    "createdAt": "2022-04-21T08:07:58.000Z",
    "updatedAt": "2022-05-06T16:24:00+09:00",
    "id": 1,
    "title": "1つ目のTODO!",
    "description": "後で消す"
  },
  "isDirty": true,
  "dirty": {
    "updatedAt": "2022-05-06T16:24:00+09:00",
    "title": "1つ目のTODO!",
    "description": "後で消す"
  },
  "original": {
    "completedAt": null,
    "createdAt": "2022-04-21T08:07:58.000Z",
    "updatedAt": "2022-04-21T09:32:41.000Z",
    "id": 1,
    "title": "1つ目のTODO",
    "description": "後で書く"
  }
}
```

なんにも変更がないとisDirtyがfalseになってdirtyが空で返ります

- テストを修正する

/api/test/todo/todo.e2e-spec.tsを以下で編集する

```ts
describe('編集テスト', () => {
  it('OK /todo/:id (PATCH)', async () => {
    // 編集用データ作成
    const createRes = await create({
      title: 'before test title',
    });
    const id = createRes.body.data.id;

    // 更新日ずらすためにちょっと止める
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await sleep(1000);

    const res = await update(id, {
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

  // ...省略
  it('NG(type error) /todo/:id (PATCH)', async () => {
    const res = await update('aa', {
      title: 'update test title',
    });
    // ステータスの確認
    expect(res.status).toEqual(404); // 422→404変更
    // レスポンス内の成否の確認
    expect(res.body.success).toEqual(false); //追加
  });

  it('NG(validation error) /todo/:id (PATCH)', async () => {
    // 編集用データ作成
    const createRes = await create({
      title: 'before test title',
    });
    const id = createRes.body.data.id; // createRes.body.raw.insertId→createRes.body.data.id変更

    // ...省略
  });
});
```

変更データの確認が簡単になったねやったね

- テストのimportをrequireに変更する

```shell
test/app.e2e-spec.ts:24:12 - error TS2349: This expression is not callable.
  Type 'typeof supertest' has no call signatures.

24     return request(app.getHttpServer())
              ~~~~~~~

  test/app.e2e-spec.ts:3:1
    3 import * as request from 'supertest';
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Type originates at this import. A namespace-style import cannot be called or constructed, and will cause a failure at runtime. Consider using a default import or import require here instead.
```

怒ってるので/api/test/app.e2e-spec.tsと/api/test/todo/todo.e2e-spec.tsを以下で編集する

```ts
import * as request from 'supertest'; // 削除
import request = require('supertest'); // 追加
```

- 削除機能のレスポンスを整える

/api/src/todo/todo.service.tsの一件取得メソッドを編集する

削除のレスポンスってどうがいいんだろうね？

```ts
export class TodoService {
  // ...省略
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
```

/api/src/todo/todo.controller.tsのアクションを変更する

Serviceでデータが取れなかったときの対処をした(実際したのはfindOne)からController側は不要になったのでまるっと削除

```ts
export class TodoController {
  // ...省略
  @Delete(':id')
  async delete(@Param() params: { id: string }) {
    return await this.service.delete(Number(params.id));
  }
}
```


- アクセスしてみる

サーバーを起動する

```shell
docker-compose exec api sh
npm run start:webpack
```

ターミナルでDELETEアクセス

```shell
curl http://localhost:3000/todo/3 -X DELETE
```

以下のように登録データが返ってきたらヨシ！

```json
{
  "success": true,
  "data": {
    "completedAt": null,
    "createdAt": "2022-05-02T16:47:40.000Z",
    "updatedAt": "2022-05-02T16:47:40.000Z",
    "id": 3,
    "title": "3つ目のTODO",
    "description": null
  }
}
```

http://localhost:3000/todo にブラウザでアクセス

消えてるのを確認できたらヨシ！

- テストを修正する

/api/test/todo/todo.e2e-spec.tsを以下で編集する

```ts
describe('削除テスト', () => {
  it('OK /todo/:id (DELETE)', async () => {
    // 削除用データ作成
    const createRes = await create({
      title: 'delete test',
    });
    const id = createRes.body.data.id;

    const res = await deleteOne(id);
    // ステータスの確認
    expect(res.status).toEqual(200);
    // レスポンス内の成否の確認
    expect(res.body.success).toEqual(true);

    // 削除されたので取得できないことの確認
    const findRes = await findOne(id);
    // ステータスの確認
    expect(findRes.status).toEqual(404);
  });

  // ...省略
  it('NG(type error) /todo/:id (DELETE)', async () => {
    const res = await deleteOne('a');
    // ステータスの確認
    expect(res.status).toEqual(404); // 422→404変更
    // レスポンス内の成否の確認
    expect(res.body.success).toEqual(false); //追加
  });
});
```

正常時も異常時も合わせてレスポンスになんとなく統一感でたのでヨシ！
