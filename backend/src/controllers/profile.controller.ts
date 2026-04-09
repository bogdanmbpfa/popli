import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { DAccount } from '@decorators';
import { AuthenticatedGuard } from '@guards';
import {
  AccountDTO,
  ProfileDTO,
  ProfileDailyClicksDTO,
  ProfileTotalClicksDTO,
} from '@resources';
import { ProfileService } from '@services';

@Controller('/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('/analytics/daily-clicks')
  @ApiOperation({ summary: 'Get daily profile clicks analytics' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Daily clicks',
    type: () => ProfileDailyClicksDTO,
  })
  @UseGuards(AuthenticatedGuard)
  getDailyClicks(
    @DAccount() account: AccountDTO,
  ): Promise<ProfileDailyClicksDTO> {
    return this.profileService.getDailyClicks(account.id);
  }

  @Get('/analytics/total-clicks')
  @ApiOperation({ summary: 'Get total profile clicks analytics' })
  @ApiHeader({
    name: 'Authorization',
    description: 'The token to access the account',
    required: true,
    example: 'Bearer <token>',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Total clicks analytics',
    type: () => ProfileTotalClicksDTO,
  })
  @UseGuards(AuthenticatedGuard)
  getTotalClicks(
    @DAccount() account: AccountDTO,
  ): Promise<ProfileTotalClicksDTO> {
    return this.profileService.getTotalClicks(account.id);
  }

  @Get('/handles')
  @ApiOperation({ summary: 'Get profile handles' })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Profile handles retrieved',
    type: () => String,
    isArray: true,
  })
  async getProfileHandles(): Promise<string[]> {
    return await this.profileService.getProfileHandles();
  }

  @Get('/:handle')
  @ApiOperation({ summary: 'Get profile' })
  @ApiParam({ name: 'handle', description: 'The handle of the profile' })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved',
    type: () => ProfileDTO,
  })
  async getProfile(@Param('handle') handle: string): Promise<ProfileDTO> {
    return await this.profileService.getProfile(handle);
  }

  @Post('/:handle/access')
  @ApiOperation({ summary: 'Register profile access' })
  @ApiParam({ name: 'handle', description: 'The handle of the profile' })
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Profile access registered' })
  async registerProfileAccess(
    @Param('handle') handle: string,
    @Req() request: Request,
  ): Promise<void> {
    return await this.profileService.registerProfileAccess(
      handle,
      request.ip || '',
      request.headers['user-agent'] || '',
      request.headers['referer'],
    );
  }
}
