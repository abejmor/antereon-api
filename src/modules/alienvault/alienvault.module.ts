import { Module } from '@nestjs/common';
import { AlienvaultController } from './infrastructure/alienvault.controller';
import { AlienvaultService } from './domain/services/alienvault.service';
import { IntegrationModule } from '@/modules/integration/integration.module';
import { StatisticsModule } from '@/modules/statistics/statistics.module';

@Module({
  imports: [IntegrationModule, StatisticsModule],
  controllers: [AlienvaultController],
  providers: [AlienvaultService],
})
export class AlienvaultModule {}
