import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from '../integration/domain/integration.entity';
import { IOCAnalysisResult } from '../ioc-analysis/domain/ioc-analysis-result.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
    @InjectRepository(IOCAnalysisResult)
    private iocAnalysisRepository: Repository<IOCAnalysisResult>,
  ) {}

  async incrementUsageCount(userId: string, provider: string): Promise<void> {
    await this.integrationRepository
      .createQueryBuilder()
      .update(Integration)
      .set({ usageCount: () => 'usageCount + 1' })
      .where('userId = :userId AND provider = :provider', { userId, provider })
      .execute();
  }

  async getHomeStats(userId: string) {
    const integrations = await this.integrationRepository.find({
      where: { userId },
      select: ['provider', 'name', 'isActive', 'usageCount'],
    });

    const totalSearches = integrations.reduce(
      (sum, integration) => sum + (integration.usageCount || 0),
      0,
    );

    const activeIntegrations = integrations.filter(
      (integration) => integration.isActive,
    ).length;

    const topProviders = integrations
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 3)
      .map((integration) => ({
        provider: integration.provider,
        searches: integration.usageCount || 0,
      }));

    return {
      totalSearches,
      activeIntegrations,
      totalIntegrations: integrations.length,
      topProviders,
    };
  }

  async getAllStats() {
    const integrations = await this.integrationRepository.find({
      select: ['provider', 'isActive', 'usageCount'],
    });

    const totalSearches = integrations.reduce(
      (sum, integration) => sum + (integration.usageCount || 0),
      0,
    );

    const activeIntegrations = integrations.filter(
      (integration) => integration.isActive,
    ).length;

    const providerStats = await this.iocAnalysisRepository
      .createQueryBuilder('ioc')
      .select('ioc.provider', 'provider')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ioc.provider')
      .getRawMany();

    const analysesByProvider: Record<string, number> = {};
    providerStats.forEach((stat: { provider: string; count: string }) => {
      analysesByProvider[stat.provider] = parseInt(stat.count);
    });

    const typeStats = await this.iocAnalysisRepository
      .createQueryBuilder('ioc')
      .select('ioc.iocType', 'iocType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ioc.iocType')
      .getRawMany();

    const analysesByType: Record<string, number> = {};
    typeStats.forEach((stat: { iocType: string; count: string }) => {
      analysesByType[stat.iocType] = parseInt(stat.count);
    });

    return {
      totalSearches,
      totalIntegrations: integrations.length,
      activeIntegrations,
      analysesByProvider,
      analysesByType,
    };
  }
}
