import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike } from 'typeorm';
import { IOCAnalysisResult } from '../ioc-analysis-result.entity';
import {
  CreateIOCAnalysisResultDto,
  IOCAnalysisResultResponseDto,
  IOCCardResponseDto,
  GetIOCAnalysisResultsQueryDto,
} from '../../infrastructure/ioc-analysis.dto';

@Injectable()
export class IOCAnalysisService {
  constructor(
    @InjectRepository(IOCAnalysisResult)
    private readonly iocAnalysisRepository: Repository<IOCAnalysisResult>,
  ) {}

  async create(
    userId: string,
    createDto: CreateIOCAnalysisResultDto,
  ): Promise<IOCAnalysisResultResponseDto> {
    const status = createDto.error ? 'error' : 'success';

    const analysisResult = this.iocAnalysisRepository.create({
      iocValue: createDto.iocValue,
      iocType: createDto.iocType,
      provider: createDto.provider,
      status,
      data: createDto.data,
      error: createDto.error,
      userId,
      analysisTimestamp: new Date(createDto.analysisTimestamp),
    });

    const savedResult = await this.iocAnalysisRepository.save(analysisResult);
    return this.toResponseDto(savedResult);
  }

  async findAll(
    userId: string,
    query: GetIOCAnalysisResultsQueryDto,
  ): Promise<{
    results: IOCCardResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, iocType, provider, iocValue } = query;

    const where: FindManyOptions<IOCAnalysisResult>['where'] = { userId };

    if (iocType) {
      where.iocType = iocType;
    }
    if (provider) {
      where.provider = provider;
    }
    if (iocValue) {
      where.iocValue = ILike(`%${iocValue}%`);
    }

    const [results, total] = await this.iocAnalysisRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      results: results.map((result) => this.toOptimizedResponseDto(result)),
      total,
      page,
      limit,
    };
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<IOCAnalysisResultResponseDto> {
    const result = await this.getAnalysisResultOrFail(id, userId);
    return this.toResponseDto(result);
  }

  async findByIOCAndProvider(
    userId: string,
    iocValue: string,
    provider: string,
  ): Promise<IOCAnalysisResultResponseDto[]> {
    const results = await this.iocAnalysisRepository.find({
      where: {
        userId,
        iocValue,
        provider,
      },
      order: { createdAt: 'DESC' },
    });

    return results.map((result) => this.toResponseDto(result));
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.getAnalysisResultOrFail(id, userId);
    await this.iocAnalysisRepository.remove(result);
  }

  async deleteAll(userId: string): Promise<void> {
    await this.iocAnalysisRepository.delete({ userId });
  }

  private async getAnalysisResultOrFail(
    id: string,
    userId: string,
  ): Promise<IOCAnalysisResult> {
    const result = await this.iocAnalysisRepository.findOne({
      where: { id, userId },
    });
    if (!result) {
      throw new NotFoundException(
        `IOC analysis result with ID ${id} not found`,
      );
    }
    return result;
  }

  async getStatistics(userId: string): Promise<{
    totalAnalyses: number;
    analysesByProvider: Record<string, number>;
    analysesByType: Record<string, number>;
    recentAnalyses: IOCAnalysisResultResponseDto[];
  }> {
    const totalAnalyses = await this.iocAnalysisRepository.count({
      where: { userId },
    });

    const providerStats = await this.iocAnalysisRepository
      .createQueryBuilder('analysis')
      .select('analysis.provider', 'provider')
      .addSelect('COUNT(*)', 'count')
      .where('analysis.userId = :userId', { userId })
      .groupBy('analysis.provider')
      .getRawMany();

    const typeStats = await this.iocAnalysisRepository
      .createQueryBuilder('analysis')
      .select('analysis.iocType', 'iocType')
      .addSelect('COUNT(*)', 'count')
      .where('analysis.userId = :userId', { userId })
      .groupBy('analysis.iocType')
      .getRawMany();

    const recentResults = await this.iocAnalysisRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      totalAnalyses,
      analysesByProvider: Object.fromEntries(
        providerStats.map((s: { provider: string; count: string }) => [
          s.provider,
          parseInt(s.count),
        ]),
      ),
      analysesByType: Object.fromEntries(
        typeStats.map((s: { iocType: string; count: string }) => [
          s.iocType,
          parseInt(s.count),
        ]),
      ),
      recentAnalyses: recentResults.map((r) => this.toResponseDto(r)),
    };
  }

  private toOptimizedResponseDto(
    result: IOCAnalysisResult,
  ): IOCCardResponseDto {
    return {
      id: result.id,
      iocValue: result.iocValue,
      iocType: result.iocType,
      provider: result.provider,
      status: result.status,
      error: result.error,
      analysisTimestamp: result.analysisTimestamp,
    };
  }

  private toResponseDto(
    result: IOCAnalysisResult,
  ): IOCAnalysisResultResponseDto {
    return {
      id: result.id,
      iocValue: result.iocValue,
      iocType: result.iocType,
      provider: result.provider,
      status: result.status,
      apiData: result.data,
      error: result.error,
      analysisTimestamp: result.analysisTimestamp,
      userId: result.userId,
    };
  }
}
