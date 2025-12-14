import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwtAuth.guard';
import { IntegrationService } from '../domain/integration.service';

export class IntegrationStatusResponse {
  provider: string;
  isActive: boolean;
  hasApiKey: boolean;
}

@ApiTags('integrations')
@ApiBearerAuth()
@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationStatusController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('status/:provider')
  @ApiOperation({ summary: 'Check integration status for a provider' })
  @ApiResponse({
    status: 200,
    description: 'Integration status',
    type: IntegrationStatusResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found or not active',
  })
  async getIntegrationStatus(
    @Param('provider') provider: string,
    @Req() req: { user: { id: string } },
  ): Promise<IntegrationStatusResponse> {
    try {
      const integration = await this.integrationService.findByProviderAndUser(
        provider,
        req.user.id,
      );

      if (!integration) {
        throw new NotFoundException(
          `Integration for provider '${provider}' not found`,
        );
      }

      return {
        provider,
        isActive: integration.isActive,
        hasApiKey: !!integration.encryptedApiKey,
      };
    } catch (error) {
      throw new NotFoundException(
        `Integration for provider '${provider}' not found or not active`,
      );
    }
  }
}
