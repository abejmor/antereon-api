import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwtAuth.guard';
import { AbuseipdbService } from '../domain/services/abuseipdb.service';
import {
  AbuseIPDBResponse,
  AbuseIpCheckDto,
  ReportIpDto,
} from '@/modules/abuseipdb/infrastructure/abuseipdb.dto';

@ApiTags('abuseipdb')
@ApiBearerAuth()
@Controller('abuseipdb')
@UseGuards(JwtAuthGuard)
export class AbuseipdbController {
  constructor(private readonly abuseipdbService: AbuseipdbService) {}

  @Post('ip')
  @ApiOperation({ summary: 'Check IP address in AbuseIPDB' })
  @ApiResponse({
    status: 200,
    description: 'IP analysis from AbuseIPDB',
    type: AbuseIPDBResponse,
  })
  async checkIp(
    @Body() checkIpDto: AbuseIpCheckDto,
    @Req() req: { user: { id: string } },
  ): Promise<AbuseIPDBResponse> {
    return this.abuseipdbService.checkIp(
      checkIpDto.ip,
      checkIpDto.integrationId,
      req.user.id,
    );
  }

  @Post('report')
  @ApiOperation({ summary: 'Report IP address to AbuseIPDB' })
  @ApiResponse({
    status: 201,
    description: 'IP reported successfully to AbuseIPDB',
    type: AbuseIPDBResponse,
  })
  async reportIp(
    @Body() reportIpDto: ReportIpDto,
    @Req() req: { user: { id: string } },
  ): Promise<AbuseIPDBResponse> {
    return this.abuseipdbService.reportIp(
      reportIpDto.ip,
      reportIpDto.categories,
      reportIpDto.comment,
      reportIpDto.integrationId,
      req.user.id,
    );
  }
}
