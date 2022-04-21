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

