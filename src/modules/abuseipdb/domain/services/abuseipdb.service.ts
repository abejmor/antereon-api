import { Injectable } from '@nestjs/common';
import { IntegrationService } from '@/modules/integration/domain/integration.service';
import { AbuseIPDBResponse } from '@/modules/abuseipdb/infrastructure/abuseipdb.dto';
import { StatisticsService } from '@/modules/statistics/statistics.service';
import axios from 'axios';

@Injectable()
export class AbuseipdbService {
  private readonly baseUrl = 'https://api.abuseipdb.com/api/v2';

  constructor(
    private readonly integrationService: IntegrationService,
    private readonly statisticsService: StatisticsService,
  ) {}

  private async getApiKey(
    integrationId: string,
    userId: string,
  ): Promise<string> {
    try {
      const integration = await this.integrationService.findById(
        integrationId,
        userId,
      );

      if (!integration || !integration.isActive) {
        throw new Error(
          'abuseipdb integration not found or not active for this user',
        );
      }

      const apiKey = await this.integrationService.getDecryptedApiKey(
        integrationId,
        userId,
      );

      return apiKey;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`failed to get abuseipdb API key: ${errorMessage}`);
    }
  }

  private async makeRequest(
    endpoint: string,
    integrationId: string,
    userId: string,
    params?: Record<string, string>,
  ): Promise<AbuseIPDBResponse> {
    const apiKey = await this.getApiKey(integrationId, userId);
    const url = `${this.baseUrl}/${endpoint}`;

    const config = {
      params,
      headers: {
        Key: apiKey,
        Accept: 'application/json',
      },
    };

    try {
      const response = await axios.get(url, config);

      await this.statisticsService.incrementUsageCount(userId, 'abuseipdb');

      return {
        provider: 'abuseipdb',
        status: 'success' as const,
        apiData: response.data as Record<string, unknown>,
        analysisTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AbuseIPDB API error: ${errorMessage}`);
    }
  }

  async checkIp(
    ip: string,
    integrationId: string,
    userId: string,
  ): Promise<AbuseIPDBResponse> {
    const params = {
      ipAddress: ip,
      maxAgeInDays: '90',
      verbose: 'true',
    };

    return this.makeRequest('check', integrationId, userId, params);
  }

  async reportIp(
    ip: string,
    categories: number[],
    comment: string,
    integrationId: string,
    userId: string,
  ): Promise<AbuseIPDBResponse> {
    const apiKey = await this.getApiKey(integrationId, userId);
    const url = `${this.baseUrl}/report`;

    const data = {
      ip,
      categories: categories.join(','),
      comment,
    };

    const config = {
      headers: {
        Key: apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post(url, data, config);

      return {
        provider: 'abuseipdb',
        status: 'success' as const,
        apiData: response.data as Record<string, unknown>,
        analysisTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AbuseIPDB API error: ${errorMessage}`);
    }
  }
}
