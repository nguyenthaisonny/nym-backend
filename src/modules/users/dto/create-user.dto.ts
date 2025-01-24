import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsPhoneNumber()
  @IsOptional()
  phone: string;

  @IsOptional()
  address: string;

  @IsOptional()
  image: string;
}
