import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IOCAnalysisResult } from './domain/ioc-analysis-result.entity';
import { IOCAnalysisService } from './domain/services/ioc-analysis.service';
import { IOCAnalysisController } from './infrastructure/ioc-analysis.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IOCAnalysisResult])],
  controllers: [IOCAnalysisController],
  providers: [IOCAnalysisService],
  exports: [IOCAnalysisService],
})
export class IOCAnalysisModule {}
