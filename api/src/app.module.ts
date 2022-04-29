import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/database.service';
import { TodoModule } from './todo/todo.module';

let envFilePath = './src/config/.env';
if (process.env.NODE_ENV) {
  envFilePath = './src/config/.env.' + process.env.NODE_ENV;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [envFilePath],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
      inject: [ConfigService],
    }),
    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
