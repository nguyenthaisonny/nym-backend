import { IsMongoId, IsNotEmpty } from 'class-validator';

export class FilterUserDto {}

export class FindOneUserByIdDto {
  @IsMongoId({ message: 'Invalid _id!' })
  @IsNotEmpty()
  _id: string;
}
