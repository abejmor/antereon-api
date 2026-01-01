import { Injectable } from '@nestjs/common';
import { IntegrationService } from '@/modules/integration/domain/services/integration.service';
import { VirusTotalResponse } from '@/modules/virustotal/infrastructure/virustotal.dto';
import { StatisticsService } from '@/modules/statistics/domain/services/statistics.service';
import { BaseProviderService } from '@/modules/shared/base-provider.service';

@Injectable()
export class VirustotalService extends BaseProviderService {
  protected readonly baseUrl = 'https://www.virustotal.com/api/v3';
  protected readonly providerName = 'virustotal';

  constructor(
    integrationService: IntegrationService,
    statisticsService: StatisticsService,
  ) {
    super(integrationService, statisticsService);
  }

  protected buildHeaders(apiKey: string): Record<string, string> {
    return {
      'x-apikey': apiKey,
    };
  }

  async checkIp(
    ip: string,
    integrationId: string,
    userId: string,
  ): Promise<VirusTotalResponse> {
    const url = `${this.baseUrl}/ip_addresses/${ip}`;
    return this.makeRequest<VirusTotalResponse>(url, integrationId, userId, {
      method: 'GET',
    });
  }

  async checkDomain(
    domain: string,
    integrationId: string,
    userId: string,
  ): Promise<VirusTotalResponse> {
    const url = `${this.baseUrl}/domains/${domain}`;
    return this.makeRequest<VirusTotalResponse>(url, integrationId, userId, {
      method: 'GET',
    });
  }

  async checkHash(
    hash: string,
    integrationId: string,
    userId: string,
  ): Promise<VirusTotalResponse> {
    const url = `${this.baseUrl}/files/${hash}`;
    return this.makeRequest<VirusTotalResponse>(url, integrationId, userId, {
      method: 'GET',
    });
  }

  async analyzeUrl(
    urlToAnalyze: string,
    integrationId: string,
    userId: string,
  ): Promise<VirusTotalResponse> {
    const url = `${this.baseUrl}/urls`;
    const formData = new URLSearchParams();
    formData.append('url', urlToAnalyze);

    return this.makeRequest<VirusTotalResponse>(url, integrationId, userId, {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async getUrlAnalysisReport(
    analysisId: string,
    integrationId: string,
    userId: string,
  ): Promise<VirusTotalResponse> {
    const url = `${this.baseUrl}/analyses/${analysisId}`;
    return this.makeRequest<VirusTotalResponse>(url, integrationId, userId, {
      method: 'GET',
    });
  }
}
