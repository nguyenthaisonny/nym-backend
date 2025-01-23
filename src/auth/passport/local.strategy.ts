
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadGatewayException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException("Incorrect username or password!");
    }
    if(user?.isActive === false) throw new BadGatewayException("Your account is not activated!")
    const { password: pass, ...rest } = user
    return user;
  }
}
