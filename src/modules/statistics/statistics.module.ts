import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Integration } from '../integration/domain/integration.entity';
import { IOCAnalysisResult } from '../ioc-analysis/domain/ioc-analysis-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Integration, IOCAnalysisResult])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
