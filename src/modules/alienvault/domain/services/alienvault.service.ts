import { Injectable } from '@nestjs/common';
import { IntegrationService } from '@/modules/integration/domain/services/integration.service';
import { AlienVaultResponse } from '@/modules/alienvault/infrastructure/alienvault.dto';
import { StatisticsService } from '@/modules/statistics/domain/services/statistics.service';
import { BaseProviderService } from '@/modules/shared/base-provider.service';

@Injectable()
export class AlienvaultService extends BaseProviderService {
  protected readonly baseUrl = 'https://otx.alienvault.com/api/v1';
  protected readonly providerName = 'alienvault';

  constructor(
    integrationService: IntegrationService,
    statisticsService: StatisticsService,
  ) {
    super(integrationService, statisticsService);
  }

  protected buildHeaders(apiKey: string): Record<string, string> {
    return {
      'X-OTX-API-KEY': apiKey,
      Accept: 'application/json',
    };
  }

  async checkIp(
    ip: string,
    integrationId: string,
    userId: string,
  ): Promise<AlienVaultResponse> {
    const url = `${this.baseUrl}/indicators/IPv4/${ip}/general`;
    return this.makeRequest<AlienVaultResponse>(url, integrationId, userId, {
      method: 'GET',
    });
  }

  async checkDomain(
    domain: string,
    integrationId: string,
    userId: string,
  ): Promise<AlienVaultResponse> {
    const url = `${this.baseUrl}/indicators/domain/${domain}/general`;
    return this.makeRequest<AlienVaultResponse>(url, integrationId, userId, {
      method: 'GET',
    });
  }

  async checkHash(
    hash: string,
    integrationId: string,
    userId: string,
  ): Promise<AlienVaultResponse> {
    const url = `${this.baseUrl}/indicators/file/${hash}/general`;
    return this.makeRequest<AlienVaultResponse>(url, integrationId, userId, {
      method: 'GET',
    });
  }

  async checkUrl(
    urlToCheck: string,
    integrationId: string,
    userId: string,
  ): Promise<AlienVaultResponse> {
    const encodedUrl = Buffer.from(urlToCheck).toString('base64');
    const url = `${this.baseUrl}/indicators/url/${encodedUrl}/general`;
    return this.makeRequest<AlienVaultResponse>(url, integrationId, userId, {
      method: 'GET',
    });
  }
}
