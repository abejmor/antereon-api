import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { IntegrationService } from '../domain/integration.service';
import {
  CreateIntegrationDto,
  UpdateIntegrationDto,
  IntegrationResponseDto,
  ListIntegrationsInputDto,
} from './integration.dto';
import { DecryptedApiKeyResponseDto } from './integration-decrypted.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('integrations')
@ApiBearerAuth()
@Controller('integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post()
  @ApiOperation({ summary: 'create a new integration' })
  @ApiResponse({
    status: 201,
    description: 'integration created successfully',
    type: IntegrationResponseDto,
  })
  @ApiResponse({ status: 409, description: 'integration already exists' })
  async create(
    @Request() req: { user: { id: string } },
    @Body() createIntegrationDto: CreateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    return this.integrationService.create(req.user.id, createIntegrationDto);
  }

  @Get()
  @ApiOperation({ summary: 'get all user integrations with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'list of user integrations',
    type: [IntegrationResponseDto],
  })
  async findAll(
    @Request() req: { user: { id: string } },
    @Query() filters?: ListIntegrationsInputDto,
  ): Promise<IntegrationResponseDto[]> {
    return this.integrationService.findAllByUser(req.user.id, filters);
  }

  @Get('active')
  @ApiOperation({ summary: 'get all active user integrations' })
  @ApiResponse({
    status: 200,
    description: 'list of active user integrations',
    type: [IntegrationResponseDto],
  })
  async findActive(
    @Request() req: { user: { id: string } },
  ): Promise<IntegrationResponseDto[]> {
    const activeIntegrations = await this.integrationService.findActiveByUser(
      req.user.id,
    );
    return activeIntegrations.map((integration) =>
      this.integrationService['toResponseDto'](integration),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'get integration by ID' })
  @ApiResponse({
    status: 200,
    description: 'integration found',
    type: IntegrationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'integration not found' })
  async findOne(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ): Promise<IntegrationResponseDto> {
    return this.integrationService.findById(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'update integration' })
  @ApiResponse({
    status: 200,
    description: 'integration updated successfully',
    type: IntegrationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'integration not found' })
  async update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateIntegrationDto: UpdateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    return this.integrationService.update(
      id,
      req.user.id,
      updateIntegrationDto,
    );
  }

  @Put(':id/toggle')
  @ApiOperation({ summary: 'toggle integration active status' })
  @ApiResponse({
    status: 200,
    description: 'integration status toggled successfully',
    type: IntegrationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'integration not found' })
  async toggleActive(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ): Promise<IntegrationResponseDto> {
    return this.integrationService.toggleActive(id, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'delete integration' })
  @ApiResponse({ status: 204, description: 'integration deleted successfully' })
  @ApiResponse({ status: 404, description: 'integration not found' })
  async remove(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ): Promise<void> {
    return this.integrationService.delete(id, req.user.id);
  }

  @Get(':id/decrypted-api-key')
  @ApiOperation({
    summary: 'get decrypted API key for integration',
  })
  @ApiResponse({
    status: 200,
    description: 'decrypted API key retrieved successfully',
    type: DecryptedApiKeyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'integration not found' })
  async getDecryptedApiKey(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ): Promise<DecryptedApiKeyResponseDto> {
    const result = await this.integrationService.getDecryptedApiKeyWithDetails(
      id,
      req.user.id,
    );

    return {
      apiKey: result.apiKey,
      integrationId: result.integrationId,
      provider: result.provider,
    };
  }

  @Get(':id/test')
  @ApiOperation({ summary: 'test integration connection' })
  @ApiResponse({ status: 200, description: 'integration test successful' })
  @ApiResponse({ status: 400, description: 'integration test failed' })
  async testIntegration(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const apiKey = await this.integrationService.getDecryptedApiKey(
        id,
        req.user.id,
      );

      if (apiKey) {
        return {
          success: true,
          message: 'integration test successful',
        };
      }

      return {
        success: false,
        message: 'invalid API key',
      };
    } catch (error: any) {
      return {
        success: false,
        message: (error as Error).message || 'integration test failed',
      };
    }
  }
}
