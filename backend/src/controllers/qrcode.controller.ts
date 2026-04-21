import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Multer } from 'multer'; // Import needed for file upload to be possible

import { DAccount } from '@decorators';
import { AuthenticatedGuard } from '@guards';
import {
  AccountDTO,
  CreateQrCodeDTO,
  QrCodeAnalyticsDTO,
  QrCodeDTO,
} from '@resources';
import { QrCodeService } from '@services';

@Controller('/qr-code')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a QR code' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: () => CreateQrCodeDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'QR code created' })
  @UseGuards(AuthenticatedGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createQrCode(
    @DAccount() account: AccountDTO,
    @Body() dto: CreateQrCodeDTO,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<void> {
    return this.qrCodeService.createQrCode(account.id, { ...dto, image });
  }

  @Get('/')
  @ApiOperation({ summary: 'Get all QR codes' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'All QR codes',
    type: () => QrCodeDTO,
    isArray: true,
  })
  @UseGuards(AuthenticatedGuard)
  async getQrCodes(@DAccount() account: AccountDTO): Promise<QrCodeDTO[]> {
    return this.qrCodeService.getQrCodes(account.id);
  }

  @Get('/:id/analytics')
  @ApiOperation({ summary: 'Get QR code analytics' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'QR code analytics',
    type: () => QrCodeAnalyticsDTO,
  })
  @UseGuards(AuthenticatedGuard)
  async getQrCodeAnalytics(
    @DAccount() account: AccountDTO,
    @Param('id') id: string,
  ): Promise<QrCodeAnalyticsDTO> {
    return this.qrCodeService.getQrCodeAnalytics(account.id, id);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a QR code' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the QR code',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'QR code deleted' })
  @UseGuards(AuthenticatedGuard)
  async deleteQrCode(
    @DAccount() account: AccountDTO,
    @Param('id') id: string,
  ): Promise<void> {
    return this.qrCodeService.deleteQrCode(account.id, id);
  }

  @Get('/:id/scan')
  @ApiOperation({ summary: 'Scan a QR code' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the QR code',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'QR code scan registered and data resolved',
    type: String,
  })
  async scanQrCode(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<string> {
    return await this.qrCodeService.scanQrCode(
      id,
      request.ip || '',
      request.headers['user-agent'] || '',
      request.headers['referer'],
    );
  }
}
