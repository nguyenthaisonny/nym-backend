
import { comparePasswordHelper } from '@/helpers/utils';
import { UsersService } from '@/modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,

  ) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(username);
    if (!user) throw new UnauthorizedException("Incorrect username!");

    const isValidPassword = await comparePasswordHelper(pass, user.password)
    if (!isValidPassword) throw new UnauthorizedException("Incorrect password!");

    const { password, ...result } = user;
    // TODO: Generate a JWT and return it here
    const payload = { sub: user._id, username: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    }
  }
}
