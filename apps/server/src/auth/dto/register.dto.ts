import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsString()
  @MinLength(8, { message: '密码至少 8 位' })
  @Matches(/(?=.*[a-zA-Z])(?=.*\d)/, {
    message: '密码必须同时包含字母和数字',
  })
  password: string;
}
