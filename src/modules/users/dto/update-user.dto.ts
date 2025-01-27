import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto extends OmitType(CreateUserDto, [
  'password',
  'email',
] as const) {
  @IsMongoId({ message: 'Invalid _id!' })
  @IsNotEmpty()
  _id: string;
  @IsOptional()
  name: string;
}

export class CodeAuthDto {
  @IsMongoId({ message: 'Invalid _id!' })
  _id: string;
  @IsNotEmpty()
  code: string;
}

export class ResendCodeDto {
  @IsNotEmpty()
  email: string;
}

export class ForgotPasswordDto {
  @IsMongoId({ message: 'Invalid _id!' })
  _id: string;
  @IsNotEmpty()
  code: string;
  @IsNotEmpty()
  newPassword: string;
}

export class GenerateCodeIdDto {
  @IsMongoId({ message: 'Invalid _id!' })
  _id: string;
  @IsOptional()
  numDuration: number;
  @IsOptional()
  typeOfTime: 'day' | 'minutes' | 'seconds';
}
