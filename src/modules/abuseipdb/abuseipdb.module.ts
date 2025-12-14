import { Module } from '@nestjs/common';
import { AbuseipdbController } from './infrastructure/abuseipdb.controller';
import { AbuseipdbService } from './domain/services/abuseipdb.service';
import { IntegrationModule } from '../integration/integration.module';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  imports: [IntegrationModule, StatisticsModule],
  controllers: [AbuseipdbController],
  providers: [AbuseipdbService],
})
export class AbuseipdbModule {}
