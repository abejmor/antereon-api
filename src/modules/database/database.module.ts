import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretsService } from '../secrets/secrets.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (secretsService: SecretsService) => {
        const dbConfig = secretsService.getConfigSecrets('database');
        const env = secretsService.getRuntimeEnv();

        return {
          type: 'postgres',
          host: dbConfig.host,
          port: Number(dbConfig.port),
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: env !== 'production',
          logging: env === 'development',
          ssl: env === 'production' ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
        };
      },
      inject: [SecretsService],
    }),
  ],
})
export class DatabaseModule {}
