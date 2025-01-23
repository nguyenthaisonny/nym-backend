import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto extends OmitType(CreateUserDto, ['password', 'email'] as const) {
    @IsMongoId({message: 'Invalid _id!'})
    @IsNotEmpty()
    _id: string
    @IsOptional()
    name: string
}
