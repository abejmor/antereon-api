import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwtAuth.guard';
import { AlienvaultService } from '@/modules/alienvault/domain/services/alienvault.service';
import {
  AlienVaultCheckIpDto,
  CheckDomainDto,
  CheckHashDto,
  CheckUrlDto,
  AlienVaultResponse,
} from '@/modules/alienvault/infrastructure/alienvault.dto';

@Controller('alienvault')
@UseGuards(JwtAuthGuard)
export class AlienvaultController {
  constructor(private readonly alienvaultService: AlienvaultService) {}

  @Post('check-ip')
  async checkIp(
    @Body() checkIpDto: AlienVaultCheckIpDto,
    @Req() req: { user: { id: string } },
  ): Promise<AlienVaultResponse> {
    return this.alienvaultService.checkIp(
      checkIpDto.ip,
      checkIpDto.integrationId,
      req.user.id,
    );
  }

  @Post('check-domain')
  async checkDomain(
    @Body() checkDomainDto: CheckDomainDto,
    @Req() req: { user: { id: string } },
  ): Promise<AlienVaultResponse> {
    return this.alienvaultService.checkDomain(
      checkDomainDto.domain,
      checkDomainDto.integrationId,
      req.user.id,
    );
  }

  @Post('check-hash')
  async checkHash(
    @Body() checkHashDto: CheckHashDto,
    @Req() req: { user: { id: string } },
  ): Promise<AlienVaultResponse> {
    return this.alienvaultService.checkHash(
      checkHashDto.hash,
      checkHashDto.integrationId,
      req.user.id,
    );
  }

  @Post('check-url')
  async checkUrl(
    @Body() checkUrlDto: CheckUrlDto,
    @Req() req: { user: { id: string } },
  ): Promise<AlienVaultResponse> {
    return this.alienvaultService.checkUrl(
      checkUrlDto.url,
      checkUrlDto.integrationId,
      req.user.id,
    );
  }
}
