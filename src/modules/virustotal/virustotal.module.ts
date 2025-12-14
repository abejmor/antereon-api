import { Module } from '@nestjs/common';
import { VirustotalController } from '@/modules/virustotal/infrastructure/virustotal.controller';
import { VirustotalService } from '@/modules/virustotal/domain/services/virustotal.service';
import { IntegrationModule } from '@/modules/integration/integration.module';
import { StatisticsModule } from '@/modules/statistics/statistics.module';

@Module({
  imports: [IntegrationModule, StatisticsModule],
  controllers: [VirustotalController],
  providers: [VirustotalService],
})
export class VirustotalModule {}
