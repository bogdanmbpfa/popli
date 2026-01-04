import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { DAccount } from '@decorators';
import { AuthenticatedGuard, ValidRefreshTokenGuard } from '@guards';
import {
  AccountDTO,
  AuthLoginDTO,
  AuthRegisterDTO,
  AuthRequestPasswordResetDTO,
  AuthResetPasswordDTO,
  AuthResponseDTO,
} from '@resources';
import { AuthService } from '@services';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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
  async register(
    @Body() dto: AuthRegisterDTO,
    @Req() request: Request,
  ): Promise<AuthResponseDTO> {
    return await this.authService.register(dto, request);
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
  async login(
    @Body() dto: AuthLoginDTO,
    @Req() request: Request,
  ): Promise<AuthResponseDTO> {
    return await this.authService.login(dto, request);
  }

  @Post('/logout')
  @ApiOperation({ summary: 'Logout from the account' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Account logged out' })
  @UseGuards(AuthenticatedGuard, ValidRefreshTokenGuard)
  async logout(@DAccount() account: AccountDTO): Promise<void> {
    return await this.authService.logout(account.sessionId!);
  }

  @Post('/refresh-token')
  @ApiOperation({ summary: 'Refresh the token' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @UseGuards(ValidRefreshTokenGuard)
  async refreshToken(
    @DAccount() account: AccountDTO,
    @Req() request: Request,
  ): Promise<AuthResponseDTO> {
    return await this.authService.refreshToken(
      account.id,
      account.sessionId!,
      request,
    );
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
    return await this.authService.requestPasswordReset(dto);
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset the password' })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AuthResetPasswordDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Password reset' })
  async resetPassword(@Body() dto: AuthResetPasswordDTO): Promise<void> {
    return await this.authService.resetPassword(dto);
  }
}
