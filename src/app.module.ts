import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AbuseipdbModule } from './modules/abuseipdb/abuseipdb.module';
import { VirustotalModule } from './modules/virustotal/virustotal.module';
import { AlienvaultModule } from './modules/alienvault/alienvault.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwtAuth.guard';
import { APP_GUARD } from '@nestjs/core';
import { IntegrationModule } from '@/modules/integration/integration.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { SecretsModule } from '@/modules/secrets/secrets.module';
import { StatisticsModule } from '@/modules/statistics/statistics.module';
import { IOCAnalysisModule } from '@/modules/ioc-analysis/ioc-analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SecretsModule,
    DatabaseModule,
    AbuseipdbModule,
    VirustotalModule,
    AlienvaultModule,
    UserModule,
    AuthModule,
    IntegrationModule,
    StatisticsModule,
    IOCAnalysisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
