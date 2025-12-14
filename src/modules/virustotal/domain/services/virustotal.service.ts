import { Injectable } from '@nestjs/common';
import { IntegrationService } from '@/modules/integration/domain/integration.service';
import { Integration } from '@/modules/integration/domain/integration.entity';
import { VirusTotalResponse } from '@/modules/virustotal/infrastructure/virustotal.dto';
import { StatisticsService } from '@/modules/statistics/statistics.service';
import axios from 'axios';

@Injectable()
export class VirustotalService {
  private readonly baseUrl = 'https://www.virustotal.com/api/v3';

  constructor(
    private readonly integrationService: IntegrationService,
    private readonly statisticsService: StatisticsService,
  ) {}

  private async getApiKey(
    userId: string,
    integrationId: string,
  ): Promise<string> {
    try {
      return await this.integrationService.getDecryptedApiKey(
        integrationId,
        userId,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`failed to get virustotal API key: ${errorMessage}`);
    }
  }

  private async makeRequest(
    url: string,
    userId: string,
    integrationId: string,
    options?: {
      method?: 'GET' | 'POST';
      data?: unknown;
      headers?: Record<string, string>;
    },
  ): Promise<VirusTotalResponse> {
    const apiKey = await this.getApiKey(userId, integrationId);
    const config = {
      headers: {
        'x-apikey': apiKey,
        ...options?.headers,
      },
    };

    const response =
      options?.method === 'POST'
        ? await axios.post(url, options.data, config)
        : await axios.get(url, config);

    await this.statisticsService.incrementUsageCount(userId, 'virustotal');

    return {
      provider: 'virustotal',
      status: 'success' as const,
      apiData: response.data as Record<string, unknown>,
      analysisTimestamp: new Date().toISOString(),
    };
  }

  async checkIp(
    ip: string,
    userId: string,
    integrationId: string,
  ): Promise<VirusTotalResponse> {
    const url = `${this.baseUrl}/ip_addresses/${ip}`;
    return this.makeRequest(url, userId, integrationId);
  }

  async checkDomain(
    domain: string,
    userId: string,
    integrationId: string,
  ): Promise<VirusTotalResponse> {
    const url = `${this.baseUrl}/domains/${domain}`;
    return this.makeRequest(url, userId, integrationId);
  }

  async checkHash(
    hash: string,
    userId: string,
    integrationId: string,
  ): Promise<VirusTotalResponse> {
    const url = `${this.baseUrl}/files/${hash}`;
    return this.makeRequest(url, userId, integrationId);
  }

  async analyzeUrl(
    url: string,
    userId: string,
    integrationId: string,
  ): Promise<VirusTotalResponse> {
    const apiUrl = `${this.baseUrl}/urls`;
    const formData = new URLSearchParams();
    formData.append('url', url);

    return this.makeRequest(apiUrl, userId, integrationId, {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async getUrlAnalysisReport(
    analysisId: string,
    userId: string,
    integrationId: string,
  ): Promise<VirusTotalResponse> {
    const url = `${this.baseUrl}/analyses/${analysisId}`;
    return this.makeRequest(url, userId, integrationId);
  }
}
