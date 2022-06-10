import { IsNotEmpty } from 'class-validator';

export class SigninDto {
  // 必須
  @IsNotEmpty()
  id: string;

  // 必須
  @IsNotEmpty()
  password: string;
}
