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
