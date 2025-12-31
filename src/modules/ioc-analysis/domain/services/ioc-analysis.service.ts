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
      throw new NotFoundException(`IOC analysis result with ID ${id} not found`);
    }
    return result;
  }

  async getStatistics(userId: string): Promise<{
    totalAnalyses: number;
    analysesByProvider: Record<string, number>;
    analysesByType: Record<string, number>;
    recentAnalyses: IOCAnalysisResultResponseDto[];
  }> {
    const allUserAnalyses = await this.iocAnalysisRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const analysesByProvider: Record<string, number> = {};
    const analysesByType: Record<string, number> = {};

    for (const result of allUserAnalyses) {
      analysesByProvider[result.provider] = (analysesByProvider[result.provider] || 0) + 1;
      analysesByType[result.iocType] = (analysesByType[result.iocType] || 0) + 1;
    }

    const recentAnalyses = allUserAnalyses
      .slice(0, 10)
      .map((result) => this.toResponseDto(result));

    return {
      totalAnalyses: allUserAnalyses.length,
      analysesByProvider,
      analysesByType,
      recentAnalyses,
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
