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
