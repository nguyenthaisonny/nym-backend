import { comparePasswordHelper } from '@/helpers/utils';
import { UsersService } from '@/modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!user || !isValidPassword) return null;
    return user;
  }

  async handleRegister(registerDto: CreateAuthDto) {
    return this.usersService.handleRegister(registerDto);
  }
}
