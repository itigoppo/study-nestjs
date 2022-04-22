import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

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
