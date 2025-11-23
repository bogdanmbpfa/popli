import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';

import {
  AuthLoginDTO,
  AuthRegisterDTO,
  AuthRequestPasswordResetDTO,
  AuthResetPasswordDTO,
  AuthResponseDTO,
} from '@resources';
import { AuthService } from '@services';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AuthRegisterDTO })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Account registered',
    type: () => AuthResponseDTO,
  })
  async register(@Body() dto: AuthRegisterDTO): Promise<AuthResponseDTO> {
    return this.authService.register(dto);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login to the account' })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AuthLoginDTO })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Account logged in',
    type: () => AuthResponseDTO,
  })
  async login(@Body() dto: AuthLoginDTO): Promise<AuthResponseDTO> {
    return this.authService.login(dto);
  }

  @Post('/request-password-reset')
  @ApiOperation({ summary: 'Request a password reset' })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AuthRequestPasswordResetDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Password reset requested' })
  async requestPasswordReset(
    @Body() dto: AuthRequestPasswordResetDTO,
  ): Promise<void> {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset the password' })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AuthResetPasswordDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Password reset' })
  async resetPassword(@Body() dto: AuthResetPasswordDTO): Promise<void> {
    return this.authService.resetPassword(dto);
  }
}
