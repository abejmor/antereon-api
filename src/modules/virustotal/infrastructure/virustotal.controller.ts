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
      checkIpDto.integrationId,
      req.user.id,
    );
  }

  @Post('check-domain')
  async checkDomain(
    @Body() checkDomainDto: CheckDomainDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<VirusTotalResponse> {
    return this.virustotalService.checkDomain(
      checkDomainDto.domain,
      checkDomainDto.integrationId,
      req.user.id,
    );
  }

  @Post('check-hash')
  async checkHash(
    @Body() checkHashDto: CheckHashDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<VirusTotalResponse> {
    return this.virustotalService.checkHash(
      checkHashDto.hash,
      checkHashDto.integrationId,
      req.user.id,
    );
  }

  @Post('analyze-url')
  async analyzeUrl(
    @Body() analyzeUrlDto: AnalyzeUrlDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<VirusTotalResponse> {
    return this.virustotalService.analyzeUrl(
      analyzeUrlDto.url,
      analyzeUrlDto.integrationId,
      req.user.id,
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
      integrationId,
      req.user.id,
    );
  }
}
