import { Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  createJwtOptions(): JwtModuleOptions {
    const configService = new ConfigService();
    return {
      secret: configService.get<string>('JWT_SECRET_KEY'),
      signOptions: {
        expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
      },
    };
  }
}
