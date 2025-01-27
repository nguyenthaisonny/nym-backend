import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

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
  newPassword: string
}