import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
  CreateLinkDTO,
  LinkDTO,
  UrlCreateShortUrlDTO,
  UrlShortUrlCodeResponseDTO,
  UrlShortUrlCountryClicksDTO,
  UrlShortUrlDailyClicksDTO,
  UrlShortUrlDTO,
  UrlShortUrlUpdateDTO,
} from '@resources';
import { UrlService } from '@services';

@Controller('/url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('/short-url')
  @ApiOperation({ summary: 'Create a short URL' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => UrlCreateShortUrlDTO })
  @ApiResponse({ status: 200, description: 'Short URL created' })
  @UseGuards(AuthenticatedGuard)
  async createShortUrl(
    @DAccount() account: AccountDTO,
    @Body() createShortUrlDTO: UrlCreateShortUrlDTO,
  ): Promise<void> {
    return this.urlService.createShortUrl(account.id, createShortUrlDTO);
  }

  @Get('/short-url')
  @ApiOperation({ summary: 'Get all short URLs' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'All short URLs',
    type: () => UrlShortUrlDTO,
    isArray: true,
  })
  @UseGuards(AuthenticatedGuard)
  async getShortUrls(
    @DAccount() account: AccountDTO,
  ): Promise<UrlShortUrlDTO[]> {
    return this.urlService.getShortUrls(account.id);
  }

  @Get('/short-url/:shortCode')
  @ApiOperation({ summary: 'Get a short URL' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'The short code of the short URL',
    required: true,
    example: '12345678',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Short URL',
    type: () => UrlShortUrlCodeResponseDTO,
  })
  @UseGuards(AuthenticatedGuard)
  async getShortUrl(
    @Param('shortCode') shortCode: string,
    @Req() request: Request,
  ): Promise<UrlShortUrlCodeResponseDTO> {
    return this.urlService.getShortUrl(
      shortCode,
      request.ip || '',
      request.headers['user-agent'] || '',
      request.headers['referer'],
    );
  }

  @Delete('/short-url/:id')
  @ApiOperation({ summary: 'Delete a short URL' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the short URL',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Short URL deleted' })
  @UseGuards(AuthenticatedGuard)
  async deleteShortUrl(
    @DAccount() account: AccountDTO,
    @Param('id') id: string,
  ): Promise<void> {
    return this.urlService.deleteShortUrl(account.id, id);
  }

  @Patch('/short-url/:id/toggle')
  @ApiOperation({ summary: 'Toggle a short URL' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the short URL',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Short URL toggled' })
  @UseGuards(AuthenticatedGuard)
  async toggleShortUrl(
    @DAccount() account: AccountDTO,
    @Param('id') id: string,
  ): Promise<void> {
    return this.urlService.toggleShortUrl(account.id, id);
  }

  @Patch('/short-url/:id')
  @ApiOperation({ summary: 'Update a short URL' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the short URL',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => UrlShortUrlUpdateDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Short URL updated' })
  @UseGuards(AuthenticatedGuard)
  async updateShortUrl(
    @DAccount() account: AccountDTO,
    @Param('id') id: string,
    @Body() updateShortUrlDTO: UrlShortUrlUpdateDTO,
  ): Promise<void> {
    return this.urlService.updateShortUrl(account.id, id, updateShortUrlDTO);
  }

  @Get('/short-url/:id/daily-clicks')
  @ApiOperation({ summary: 'Get the daily clicks for a short URL' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the short URL',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Daily clicks',
    type: () => UrlShortUrlDailyClicksDTO,
    isArray: true,
  })
  @UseGuards(AuthenticatedGuard)
  async getShortUrlDailyClicks(
    @DAccount() account: AccountDTO,
    @Param('id') id: string,
  ): Promise<UrlShortUrlDailyClicksDTO[]> {
    return this.urlService.getShortUrlDailyClicks(account.id, id);
  }

  @Get('/short-url/:id/country-clicks')
  @ApiOperation({ summary: 'Get the country clicks for a short URL' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the short URL',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Country clicks',
    type: () => UrlShortUrlCountryClicksDTO,
    isArray: true,
  })
  @UseGuards(AuthenticatedGuard)
  async getShortUrlCountryClicks(
    @DAccount() account: AccountDTO,
    @Param('id') id: string,
  ): Promise<UrlShortUrlCountryClicksDTO[]> {
    return this.urlService.getShortUrlCountryClicks(account.id, id);
  }

  @Get('/link')
  @ApiOperation({ summary: 'Get all links' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'All links',
    type: () => LinkDTO,
    isArray: true,
  })
  @UseGuards(AuthenticatedGuard)
  async getLinks(@DAccount() account: AccountDTO): Promise<LinkDTO[]> {
    return this.urlService.getLinks(account.id);
  }

  @Post('/link')
  @ApiOperation({ summary: 'Create link' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: () => CreateLinkDTO })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Links created' })
  @UseGuards(AuthenticatedGuard)
  @UseInterceptors(FileInterceptor('backgroundImage'))
  async createLink(
    @DAccount() account: AccountDTO,
    @Body() dto: CreateLinkDTO,
    @UploadedFile() backgroundImage: Express.Multer.File,
  ): Promise<void> {
    return this.urlService.createLink(account.id, { ...dto, backgroundImage });
  }

  @Get('/link/:id/background-image')
  @ApiOperation({ summary: 'Get the background image for a link' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the link',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiProduces('application/octet-stream')
  @UseGuards(AuthenticatedGuard)
  async getLinkBackgroundImage(
    @DAccount() account: AccountDTO,
    @Param('id') id: string,
  ): Promise<Buffer> {
    return this.urlService.getLinkBackgroundImage(account.id, id);
  }

  @Delete('/link/:id')
  @ApiOperation({ summary: 'Delete a link' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the link',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Link deleted' })
  @UseGuards(AuthenticatedGuard)
  async deleteLink(
    @DAccount() account: AccountDTO,
    @Param('id') id: string,
  ): Promise<void> {
    return this.urlService.deleteLink(account.id, id);
  }

  @Post('/link/:id/click')
  @ApiOperation({ summary: 'Click a link' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the link',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Link clicked', type: () => String })
  async clickLink(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<string> {
    return await this.urlService.clickLink(
      id,
      request.ip || '',
      request.headers['user-agent'] || '',
      request.headers['referer'],
    );
  }
}
