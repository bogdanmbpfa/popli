import {
  Body,
  Controller,
  Get,
  Delete,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer'; // Import needed for file upload to be possible

import { DAccount } from '@decorators';
import { AuthenticatedGuard } from '@guards';
import {
  AccountChangePasswordDTO,
  AccountCheckEmailDTO,
  AccountCheckHandleDTO,
  AccountDTO,
  AccountProfileDTO,
  AccountRequestEmailUpdateDTO,
  AccountUpdateDTO,
  AccountUpdateEmailDTO,
  AccountUpdateProfileDTO,
  AccountVerifyEmailDTO,
  FileDTO,
} from '@resources';
import { AccountService } from '@services';

@Controller('/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('/me')
  @ApiOperation({ summary: 'Get the current account' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'The current account',
    type: () => AccountDTO,
  })
  @UseGuards(AuthenticatedGuard)
  async getAccount(@DAccount() account: AccountDTO): Promise<AccountDTO> {
    return await this.accountService.getAccount(account.id);
  }

  @Patch('/')
  @ApiOperation({ summary: 'Update the current account' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AccountUpdateDTO })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'The updated account',
  })
  @UseGuards(AuthenticatedGuard)
  async updateAccount(
    @DAccount() account: AccountDTO,
    @Body() dto: AccountUpdateDTO,
  ): Promise<void> {
    return await this.accountService.updateAccount(account.id, dto);
  }

  @Post('/request-email-verify')
  @ApiOperation({ summary: 'Request email verification' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Email verification requested' })
  @UseGuards(AuthenticatedGuard)
  async requestEmailVerify(@DAccount() account: AccountDTO): Promise<void> {
    return await this.accountService.requestEmailVerify(account);
  }

  @Post('/verify-email')
  @ApiOperation({ summary: 'Verify email' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AccountVerifyEmailDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Email verified' })
  @UseGuards(AuthenticatedGuard)
  async verifyEmail(
    @DAccount() account: AccountDTO,
    @Body() dto: AccountVerifyEmailDTO,
  ): Promise<void> {
    return await this.accountService.verifyEmail(account, dto);
  }

  @Post('/upload-profile-image')
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: () => FileDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Profile image uploaded' })
  @UseGuards(AuthenticatedGuard)
  async uploadProfileImage(
    @DAccount() account: AccountDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    return await this.accountService.uploadProfileImage(account, file);
  }

  @Post('/upload-cover-image')
  @ApiOperation({ summary: 'Upload cover image' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: () => FileDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Cover image uploaded' })
  @UseGuards(AuthenticatedGuard)
  async uploadCoverImage(
    @DAccount() account: AccountDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    return await this.accountService.uploadCoverImage(account, file);
  }

  @Post('/change-password')
  @ApiOperation({ summary: 'Change password' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AccountChangePasswordDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Password changed' })
  @UseGuards(AuthenticatedGuard)
  async changePassword(
    @DAccount() account: AccountDTO,
    @Body() dto: AccountChangePasswordDTO,
  ): Promise<void> {
    return await this.accountService.changePassword(account.id, dto);
  }

  @Post('/check-handle')
  @ApiOperation({ summary: 'Check handle' })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AccountCheckHandleDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Handle checked' })
  async checkHandle(@Body() dto: AccountCheckHandleDTO): Promise<void> {
    return await this.accountService.checkHandle(dto.handle);
  }

  @Post('/check-email')
  @ApiOperation({ summary: 'Check email' })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AccountCheckEmailDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Email checked' })
  async checkEmail(@Body() dto: AccountCheckEmailDTO): Promise<void> {
    return await this.accountService.checkEmail(dto.email);
  }

  @Patch('/update-profile')
  @ApiOperation({ summary: 'Update profile' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AccountUpdateProfileDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @UseGuards(AuthenticatedGuard)
  async updateProfile(
    @DAccount() account: AccountDTO,
    @Body() dto: AccountUpdateProfileDTO,
  ): Promise<void> {
    return await this.accountService.updateProfile(account, dto);
  }

  @Post('/request-email-update')
  @ApiOperation({ summary: 'Request email update' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AccountRequestEmailUpdateDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Email update requested' })
  @UseGuards(AuthenticatedGuard)
  async requestEmailUpdate(
    @DAccount() account: AccountDTO,
    @Body() dto: AccountRequestEmailUpdateDTO,
  ): Promise<void> {
    return await this.accountService.requestEmailUpdate(account, dto);
  }

  @Post('/update-email')
  @ApiOperation({ summary: 'Update email' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => AccountUpdateEmailDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Email updated' })
  @UseGuards(AuthenticatedGuard)
  async updateEmail(
    @DAccount() account: AccountDTO,
    @Body() dto: AccountUpdateEmailDTO,
  ): Promise<void> {
    return await this.accountService.updateEmail(account, dto);
  }

  @Delete('/')
  @ApiOperation({ summary: 'Delete account' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Account deleted' })
  @UseGuards(AuthenticatedGuard)
  async deleteAccount(@DAccount() account: AccountDTO): Promise<void> {
    return await this.accountService.deleteAccount(account);
  }

  @Get('/profile')
  @ApiOperation({ summary: 'Get profile' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  @UseGuards(AuthenticatedGuard)
  async getProfile(
    @DAccount() account: AccountDTO,
  ): Promise<AccountProfileDTO> {
    return await this.accountService.getProfile(account.id);
  }
}
