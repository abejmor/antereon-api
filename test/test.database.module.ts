import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretsModule } from '../src/modules/secrets/secrets.module';
import { SecretsService } from '../src/modules/secrets/secrets.service';

@Module({
  imports: [SecretsModule],
})
export class TestDatabaseModule {
  static forRootAsync(): DynamicModule {
    return TypeOrmModule.forRootAsync({
      imports: [SecretsModule],
      useFactory: (secretsService: SecretsService) => {
        const dbConfig = secretsService.getAppConfig().database;

        return {
          type: 'postgres',
          host: dbConfig.host,
          port: Number(dbConfig.port),
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: false,
          dropSchema: true,
          autoLoadEntities: true,
        };
      },
      inject: [SecretsService],
    });
  }
}
