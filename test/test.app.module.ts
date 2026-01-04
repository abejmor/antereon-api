import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  Logger,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SecretsModule } from '../src/modules/secrets/secrets.module';
import { TestDatabaseModule } from './test.database.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UserModule } from '../src/modules/user/user.module';
import { IntegrationModule } from '../src/modules/integration/integration.module';
import { VirustotalModule } from '../src/modules/virustotal/virustotal.module';
import { AbuseipdbModule } from '../src/modules/abuseipdb/abuseipdb.module';
import { AlienvaultModule } from '../src/modules/alienvault/alienvault.module';
import { StatisticsModule } from '../src/modules/statistics/statistics.module';
import { IOCAnalysisModule } from '../src/modules/ioc-analysis/ioc-analysis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/modules/user/domain/user.entity';
import { Integration } from '../src/modules/integration/domain/integration.entity';
import { IOCAnalysisResult } from '../src/modules/ioc-analysis/domain/ioc-analysis-result.entity';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwtAuth.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SecretsModule,
    TestDatabaseModule.forRootAsync(),
    AuthModule,
    UserModule,
    IntegrationModule,
    VirustotalModule,
    AbuseipdbModule,
    AlienvaultModule,
    StatisticsModule,
    IOCAnalysisModule,
    TypeOrmModule.forFeature([User, Integration, IOCAnalysisResult]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class TestModule implements NestModule {
  configure(): void {}
}

export const testsAppModule = async (): Promise<{
  app: INestApplication;
  nestModule: TestingModule;
}> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [TestModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();

  app.useLogger(new Logger());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  return {
    app,
    nestModule: moduleFixture,
  };
};
