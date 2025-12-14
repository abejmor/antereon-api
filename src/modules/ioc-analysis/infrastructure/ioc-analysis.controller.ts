import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwtAuth.guard';
import { IOCAnalysisService } from '../domain/services/ioc-analysis.service';
import {
  CreateIOCAnalysisResultDto,
  IOCAnalysisResultResponseDto,
  IOCCardResponseDto,
  GetIOCAnalysisResultsQueryDto,
} from './ioc-analysis.dto';

@ApiTags('ioc-analysis')
@ApiBearerAuth()
@Controller('ioc-analysis')
@UseGuards(JwtAuthGuard)
export class IOCAnalysisController {
  constructor(private readonly iocAnalysisService: IOCAnalysisService) {}

  @Post()
  @ApiOperation({ summary: 'Save IOC analysis result' })
  @ApiResponse({
    status: 201,
    description: 'IOC analysis result saved successfully',
    type: IOCAnalysisResultResponseDto,
  })
  async create(
    @Body() createDto: CreateIOCAnalysisResultDto,
    @Req() req: { user: { id: string } },
  ): Promise<IOCAnalysisResultResponseDto> {
    return this.iocAnalysisService.create(req.user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get IOC analysis results' })
  @ApiResponse({
    status: 200,
    description: 'IOC analysis results retrieved successfully',
    type: [IOCCardResponseDto],
  })
  async findAll(
    @Query() query: GetIOCAnalysisResultsQueryDto,
    @Req() req: { user: { id: string } },
  ): Promise<{
    results: IOCCardResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.iocAnalysisService.findAll(req.user.id, query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get IOC analysis statistics for current user' })
  @ApiResponse({
    status: 200,
    description: 'IOC analysis statistics retrieved successfully',
  })
  async getStatistics(@Req() req: { user: { id: string } }) {
    return this.iocAnalysisService.getStatistics(req.user.id);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search IOC analysis results by IOC value and provider',
  })
  @ApiResponse({
    status: 200,
    description: 'IOC analysis results found',
    type: [IOCAnalysisResultResponseDto],
  })
  @ApiQuery({ name: 'iocValue', required: true, type: String })
  @ApiQuery({ name: 'provider', required: true, type: String })
  async findByIOCAndProvider(
    @Query('iocValue') iocValue: string,
    @Query('provider') provider: string,
    @Req() req: { user: { id: string } },
  ): Promise<IOCAnalysisResultResponseDto[]> {
    return this.iocAnalysisService.findByIOCAndProvider(
      req.user.id,
      iocValue,
      provider,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get IOC analysis result by ID' })
  @ApiResponse({
    status: 200,
    description: 'IOC analysis result retrieved successfully',
    type: IOCAnalysisResultResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'IOC analysis result not found',
  })
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ): Promise<IOCAnalysisResultResponseDto> {
    return this.iocAnalysisService.findOne(id, req.user.id);
  }

  @Delete('all')
  @ApiOperation({ summary: 'Delete all IOC analysis results for current user' })
  @ApiResponse({
    status: 200,
    description: 'All IOC analysis results deleted successfully',
  })
  async deleteAll(@Req() req: { user: { id: string } }): Promise<void> {
    return this.iocAnalysisService.deleteAll(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete IOC analysis result by ID' })
  @ApiResponse({
    status: 200,
    description: 'IOC analysis result deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'IOC analysis result not found',
  })
  async delete(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ): Promise<void> {
    return this.iocAnalysisService.delete(id, req.user.id);
  }
}
