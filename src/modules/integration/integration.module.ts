import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Integration } from './domain/integration.entity';
import { EncryptionService } from './domain/encryption.service';
import { IntegrationService } from './domain/integration.service';
import { IntegrationController } from './infrastructure/integration.controller';
import { IntegrationStatusController } from './infrastructure/integration-status.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Integration]), ConfigModule],
  controllers: [IntegrationController, IntegrationStatusController],
  providers: [EncryptionService, IntegrationService],
  exports: [EncryptionService, IntegrationService, TypeOrmModule],
})
export class IntegrationModule {}
