import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getMetadataArgsStorage } from 'typeorm';

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
      entities: getMetadataArgsStorage().tables.map((tbl) => tbl.target),
      migrations: ['dist/migrations/**/*.js'],
      logging: true,
      synchronize: true,
      cli: {
        entitiesDir: './src/**',
        migrationsDir: './src/migrations',
      },
      keepConnectionAlive: true,
    };
  }
}
