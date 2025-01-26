import { comparePasswordHelper } from '@/helpers/utils';
import { UsersService } from '@/modules/users/users.service';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import {
  CodeAuthDto,
  ResendCodeDto,
} from '@/modules/users/dto/update-user.dto';
import * as dayjs from 'dayjs';
import { TimeoutError } from 'rxjs';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async handleLogin(user: any) {
    const payload = { sub: user._id, username: user.email };
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(username);
    if (!user) return null;
    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!isValidPassword) return null;
    return user;
  }

  async handleRegister(registerDto: CreateAuthDto) {
    return this.usersService.handleRegister(registerDto);
  }

  async handleCheckCode(checkCodeDto: CodeAuthDto) {
    const { _id, code } = checkCodeDto;
    const user = await this.usersService.findOne(_id);
    if (!user) {
      throw new BadRequestException('Invalid user!');
    }
    const { codeId, codeExpired } = user;
    const isBeforeCheck = dayjs().isBefore(codeExpired);
    if (!isBeforeCheck) throw new BadRequestException('This code has expired');
    if (code !== codeId) throw new BadRequestException('Wrong active code');
    const activeAccount = await this.usersService.activeAccount(_id);
    if (!activeAccount.acknowledged)
      throw new BadGatewayException('Runtime error');

    return activeAccount;
  }

  async handleResendCode(resendCodeDto: ResendCodeDto) {
    const user = await this.usersService.findOneByEmail(resendCodeDto.email);
    if (!user) throw new BadRequestException('This email has not registered');
    const regenrateCode = await this.usersService.regenerateCodeId(
      user._id as unknown as string,
    );
    if (!regenrateCode.acknowledged)
      throw new BadRequestException('Generate code fail');
    const { codeId } = await this.usersService.findOneByEmail(
      resendCodeDto.email,
    );
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
      user: {
        _id: user.id,
        newCode: codeId,
      },
    };
  }
}
