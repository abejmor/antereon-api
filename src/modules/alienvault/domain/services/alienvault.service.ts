import { Injectable } from '@nestjs/common';
import { IntegrationService } from '@/modules/integration/domain/integration.service';
import { AlienVaultResponse } from '@/modules/alienvault/infrastructure/alienvault.dto';
import { StatisticsService } from '@/modules/statistics/statistics.service';
import axios from 'axios';

@Injectable()
export class AlienvaultService {
  private readonly baseUrl = 'https://otx.alienvault.com/api/v1';

  constructor(
    private readonly integrationService: IntegrationService,
    private readonly statisticsService: StatisticsService,
  ) {}

  private async getApiKey(
    integrationId: string,
    userId: string,
  ): Promise<string> {
    try {
      return await this.integrationService.getDecryptedApiKey(
        integrationId,
        userId,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`failed to get alienvault API key: ${errorMessage}`);
    }
  }

  private async makeRequest(
    endpoint: string,
    integrationId: string,
    userId: string,
  ): Promise<AlienVaultResponse> {
    const apiKey = await this.getApiKey(integrationId, userId);
    const url = `${this.baseUrl}/${endpoint}`;

    const config = {
      headers: {
        'X-OTX-API-KEY': apiKey,
        Accept: 'application/json',
      },
    };

    try {
      const response = await axios.get(url, config);

      await this.statisticsService.incrementUsageCount(userId, 'alienvault');

      return {
        provider: 'alienvault',
        status: 'success' as const,
        apiData: response.data as Record<string, unknown>,
        analysisTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AlienVault API error: ${errorMessage}`);
    }
  }

  async checkIp(
    ip: string,
    integrationId: string,
    userId: string,
  ): Promise<AlienVaultResponse> {
    return this.makeRequest(
      `indicators/IPv4/${ip}/general`,
      integrationId,
      userId,
    );
  }

  async checkDomain(
    domain: string,
    integrationId: string,
    userId: string,
  ): Promise<AlienVaultResponse> {
    return this.makeRequest(
      `indicators/domain/${domain}/general`,
      integrationId,
      userId,
    );
  }

  async checkHash(
    hash: string,
    integrationId: string,
    userId: string,
  ): Promise<AlienVaultResponse> {
    return this.makeRequest(
      `indicators/file/${hash}/general`,
      integrationId,
      userId,
    );
  }

  async checkUrl(
    url: string,
    integrationId: string,
    userId: string,
  ): Promise<AlienVaultResponse> {
    const encodedUrl = Buffer.from(url).toString('base64');
    return this.makeRequest(
      `indicators/url/${encodedUrl}/general`,
      integrationId,
      userId,
    );
  }
}
