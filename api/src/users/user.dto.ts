import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Length,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateUserDto {
  // 必須
  @IsNotEmpty()
  // 型指定
  @IsAlphanumeric()
  // 20文字以内
  @Length(1, 20, { message: '$constraint2文字以下で入力してください' })
  // 前後スペースのトリム
  @Transform(({ value }: TransformFnParams) => value?.trim())
  username: string;

  // 必須
  @IsNotEmpty()
  // 型指定
  @IsEmail()
  email: string;

  // 必須
  @IsNotEmpty()
  // 型指定
  @IsAlphanumeric()
  // 8-50文字以内
  @Length(8, 50, {
    message: '$constraint1〜$constraint2文字で入力してください',
  })
  // 前後スペースのトリム
  @Transform(({ value }: TransformFnParams) => value?.trim())
  password: string;

  // 指定がなくてもOK
  @IsOptional()
  createdAt: string;

  // 指定がなくてもOK
  @IsOptional()
  updatedAt: string;
}
