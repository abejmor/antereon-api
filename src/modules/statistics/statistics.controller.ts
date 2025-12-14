import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwtAuth.guard';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { StatisticsService } from './statistics.service';

@ApiTags('statistics')
@ApiBearerAuth()
@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('home')
  @ApiOperation({ summary: 'Get home statistics for current user' })
  @ApiResponse({
    status: 200,
    description: 'Home statistics retrieved successfully',
  })
  async getHomeStats(@Req() req: { user: { id: string } }) {
    return this.statisticsService.getHomeStats(req.user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get usage statistics summary for current user' })
  @ApiResponse({
    status: 200,
    description: 'Usage statistics summary retrieved successfully',
  })
  async getSummary(@Req() req: { user: { id: string } }) {
    return this.statisticsService.getHomeStats(req.user.id);
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: 'Get global statistics for all users' })
  @ApiResponse({
    status: 200,
    description: 'Global statistics retrieved successfully',
  })
  async getAllStats() {
    return this.statisticsService.getAllStats();
  }
}
