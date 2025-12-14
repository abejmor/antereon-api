import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwtAuth.guard';
import { VirustotalService } from '@/modules/virustotal/domain/services/virustotal.service';
import type {
  AnalyzeUrlDto,
  VirusTotalResponse,
  CheckIpDto,
  CheckDomainDto,
  CheckHashDto,
  AuthenticatedRequest,
} from '@/modules/virustotal/infrastructure/virustotal.dto';

@Controller('virustotal')
@UseGuards(JwtAuthGuard)
export class VirustotalController {
  constructor(private readonly virustotalService: VirustotalService) {}

  @Post('check-ip')
  async checkIp(
    @Body() checkIpDto: CheckIpDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<VirusTotalResponse> {
    return this.virustotalService.checkIp(
      checkIpDto.ip,
      req.user.id,
      checkIpDto.integrationId,
    );
  }

  @Post('check-domain')
  async checkDomain(
    @Body() checkDomainDto: CheckDomainDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<VirusTotalResponse> {
    return this.virustotalService.checkDomain(
      checkDomainDto.domain,
      req.user.id,
      checkDomainDto.integrationId,
    );
  }

  @Post('check-hash')
  async checkHash(
    @Body() checkHashDto: CheckHashDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<VirusTotalResponse> {
    return this.virustotalService.checkHash(
      checkHashDto.hash,
      req.user.id,
      checkHashDto.integrationId,
    );
  }

  @Post('analyze-url')
  async analyzeUrl(
    @Body() analyzeUrlDto: AnalyzeUrlDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<VirusTotalResponse> {
    return this.virustotalService.analyzeUrl(
      analyzeUrlDto.url,
      req.user.id,
      analyzeUrlDto.integrationId,
    );
  }

  @Get('analysis/:analysisId')
  async getUrlAnalysisReport(
    @Param('analysisId') analysisId: string,
    @Req() req: AuthenticatedRequest,
    @Query('integrationId') integrationId: string,
  ): Promise<VirusTotalResponse> {
    return this.virustotalService.getUrlAnalysisReport(
      analysisId,
      req.user.id,
      integrationId,
    );
  }
}
