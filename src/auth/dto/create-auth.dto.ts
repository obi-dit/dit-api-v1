import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {}
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}
export class VerificationTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
