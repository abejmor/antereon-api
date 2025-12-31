import { Injectable } from '@nestjs/common';
import { IntegrationService } from '@/modules/integration/domain/services/integration.service';
import { AbuseIPDBResponse } from '@/modules/abuseipdb/infrastructure/abuseipdb.dto';
import { StatisticsService } from '@/modules/statistics/domain/services/statistics.service';
import { BaseProviderService } from '@/modules/shared/base-provider.service';

@Injectable()
export class AbuseipdbService extends BaseProviderService {
  protected readonly baseUrl = 'https://api.abuseipdb.com/api/v2';
  protected readonly providerName = 'abuseipdb';

  constructor(
    integrationService: IntegrationService,
    statisticsService: StatisticsService,
  ) {
    super(integrationService, statisticsService);
  }

  protected buildHeaders(apiKey: string): Record<string, string> {
    return {
      Key: apiKey,
      Accept: 'application/json',
    };
  }

  async checkIp(
    ip: string,
    integrationId: string,
    userId: string,
  ): Promise<AbuseIPDBResponse> {
    const url = `${this.baseUrl}/check`;
    return this.makeRequest<AbuseIPDBResponse>(url, integrationId, userId, {
      method: 'GET',
      params: {
        ipAddress: ip,
        maxAgeInDays: '90',
        verbose: 'true',
      },
    });
  }

  async reportIp(
    ip: string,
    categories: number[],
    comment: string,
    integrationId: string,
    userId: string,
  ): Promise<AbuseIPDBResponse> {
    const url = `${this.baseUrl}/report`;
    return this.makeRequest<AbuseIPDBResponse>(url, integrationId, userId, {
      method: 'POST',
      data: {
        ip,
        categories: categories.join(','),
        comment,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
