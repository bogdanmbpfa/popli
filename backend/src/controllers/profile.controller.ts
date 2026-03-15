import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';

import { ProfileDTO } from '@resources';
import { ProfileService } from '@services';

@Controller('/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

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
}
