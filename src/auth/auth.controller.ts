import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { Public, ResponMessagae } from '@/decorators/customs';
import { CreateAuthDto } from './dto/create-auth.dto';
import {
  ForgotPasswordDto,
  CodeAuthDto,
  ResendCodeDto,
} from '@/modules/users/dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Public()
  @ResponMessagae('Fetch Login')
  @Post('login')
  async login(@Request() req) {
    return this.authService.handleLogin(req.user);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('register')
  @Public()
  async register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Post('check-code')
  @Public()
  async checkCode(@Body() checkCodeDto: CodeAuthDto) {
    return this.authService.handleCheckCode(checkCodeDto);
  }

  @Post('resend-code')
  @Public()
  async resendCode(@Body() resendCodeDto: ResendCodeDto) {
    return this.authService.handleResendCode(resendCodeDto);
  }
  @Post('retry-password') 
  @Public()
  async retryPassword(@Body() resendCodeDto: ResendCodeDto) {
    return this.authService.handleRetryPassword(resendCodeDto);
  }

  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body() forgotPassword: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPassword);
  }
}
