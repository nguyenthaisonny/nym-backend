import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GenerateCodeIdDto, UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { hashPasswordHelper } from '@/helpers/utils';
import aqp from 'api-query-params';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { password, email, phone, address, image } = createUserDto;
    const errors: string[] = [];
    const isPhoneExist = await this.isPhoneExist(phone);
    if (isPhoneExist) errors.push(`This phone ${phone} has already existed!`);

    const isEmailExist = await this.isEmailExist(email);
    if (isEmailExist) errors.push(`This email: ${email} has already existed!`);
    if (errors.length > 0) throw new BadRequestException(errors.join('|'));
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
    });
    if (!user) throw new BadRequestException('Fail to create new user!');
    return {
      _id: user._id,
      email,
      phone,
      address,
      image,
    };
  }

  async isEmailExist(email: string) {
    const user = await this.userModel.exists({
      email,
    });
    if (user) return true;
    return false;
  }

  async isPhoneExist(phone: string) {
    const user = await this.userModel.exists({
      phone,
    });

    if (user) return true;
    return false;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;
    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);
    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      results,
    };
  }

  findOne(id: string) {
    return this.userModel.findOne({ _id: id });
  }

  async findOneByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async update({ _id, ...rest }: UpdateUserDto) {
    return await this.userModel.updateOne({ _id: _id }, { ...rest });
  }

  async activeAccount(_id: string) {
    return await this.userModel.updateOne({ _id: _id }, { isActive: true });
  }

  async remove(_id: string) {
    if (!mongoose.isValidObjectId(_id))
      throw new BadRequestException('Invalid _id!');
    return this.userModel.deleteOne({ _id: _id });
  }

  async regenerateCodeId({
    _id,
    numDuration = 1,
    typeOfTime = 'day',
  }: GenerateCodeIdDto) {
    return await this.userModel.updateOne(
      { _id: _id },
      {
        codeId: uuidv4(),
        codeExpired: dayjs().add(numDuration, typeOfTime),
      },
    );
  }

  async updatePassword(id: string, newPassword: string) {
    const hashPassword = await hashPasswordHelper(newPassword);
    return await this.userModel.updateOne(
      { _id: id },
      {
        password: hashPassword,
      },
    );
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { password, email, name } = registerDto;
    const errors: string[] = [];
    const isEmailExist = await this.isEmailExist(email);
    const codeId = uuidv4();
    if (isEmailExist) errors.push(`This email: ${email} has already existed!`);
    if (errors.length > 0) throw new BadRequestException(errors.join('|'));
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      ...registerDto,
      password: hashPassword,
      isActive: false,
      codeId,
      codeExpired: dayjs().add(30, 'minutes'),
    });
    if (!user) throw new BadRequestException('Fail to register!');

    //send email
    await this.mailerService.sendMail({
      to: user?.email, // list of receivers
      subject: 'Activate your account at @nguyenthaisonny ✔', // Subject lineT
      template: 'register.hbs', // HTML body content
      context: {
        name: user?.name ?? user?.email,
        activationCode: codeId,
      },
    });
    return {
      _id: user?._id,
      email,
    };
  }
}
