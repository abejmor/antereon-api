import { Injectable } from '@nestjs/common';
import { IntegrationService } from '@/modules/integration/domain/services/integration.service';
import { StatisticsService } from '@/modules/statistics/domain/services/statistics.service';
import axios, { AxiosRequestConfig } from 'axios';

export interface ProviderResponse {
  provider: string;
  status: 'success' | 'error';
  apiData?: Record<string, unknown>;
  error?: string;
  analysisTimestamp: string;
}

@Injectable()
export abstract class BaseProviderService {
  protected abstract readonly baseUrl: string;
  protected abstract readonly providerName: string;

  constructor(
    protected readonly integrationService: IntegrationService,
    protected readonly statisticsService: StatisticsService,
  ) {}

  protected async getApiKey(
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
          `${this.providerName} integration not found or not active`,
        );
      }

      return this.integrationService.getDecryptedApiKey(integrationId, userId);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get API key',
      );
    }
  }

  protected async makeRequest<T extends ProviderResponse>(
    url: string,
    integrationId: string,
    userId: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const apiKey = await this.getApiKey(integrationId, userId);
    const headers = this.buildHeaders(apiKey);

    const requestConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...headers,
        ...(config?.headers as Record<string, string>),
      },
    };

    const response = await axios.request({
      url,
      ...requestConfig,
    });

    await this.statisticsService.incrementUsageCount(userId, this.providerName);

    return {
      provider: this.providerName,
      status: 'success',
      apiData: response.data as Record<string, unknown>,
      analysisTimestamp: new Date().toISOString(),
    } as T;
  }

  protected abstract buildHeaders(apiKey: string): Record<string, string>;
}
