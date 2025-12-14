import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mainConfig, ConfigKey } from './secrets/config';
import { developmentConfig } from './secrets/development';
import { testConfig } from './secrets/test';
import { productionConfig } from './secrets/production';
import { Config } from './secrets.types';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
dotenv.config({ path: '.env.local' });

@Injectable()
export class SecretsService {
  private readonly logger = new Logger(SecretsService.name);

  constructor(private configService: ConfigService) {
    this.logger.log(
      `Loaded configuration for environment: ${this.getRuntimeEnv()}`,
    );
  }

  public getConfigSecrets<T extends ConfigKey>(name: T): Config[T] {
    const env = this.getRuntimeEnv();

    if (env === 'production') {
      return this.getEnvironmentConfig(name, productionConfig);
    }

    const envConfig = this.getEnvConfig();
    return this.getEnvironmentConfig(name, envConfig);
  }

  public getAllConfig(): Config {
    const envConfig = this.getEnvConfig();

    return {
      database: { ...mainConfig.database, ...envConfig.database },
      security: { ...mainConfig.security, ...envConfig.security },
      server: { ...mainConfig.server, ...envConfig.server },
      providers: { ...mainConfig.providers, ...envConfig.providers },
    } as Config;
  }

  private getEnvironmentConfig<T extends ConfigKey>(
    name: T,
    envConfig: Partial<Config>,
  ): Config[T] {
    return { ...mainConfig[name], ...envConfig[name] } as Config[T];
  }

  private getEnvConfig(): Partial<Config> {
    const env = this.getRuntimeEnv();

    switch (env) {
      case 'development':
        return developmentConfig;
      case 'test':
        return testConfig;
      case 'production':
        return productionConfig;
      default:
        this.logger.warn(
          `Unknown environment: ${env}, using development config`,
        );
        return developmentConfig;
    }
  }

  public getRuntimeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  public get<T = any>(key: string, defaultValue?: T): T {
    return this.configService.get<T>(key, defaultValue as T);
  }

  public has(key: string): boolean {
    return this.configService.get(key) !== undefined;
  }

  getAppConfig(): Config {
    return {
      database: this.getDatabaseConfig(),
      security: this.getSecurityConfig(),
      server: this.getServerConfig(),
      providers: this.getProvidersConfig(),
    };
  }

  private getDatabaseConfig() {
    return {
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>(
        'DB_PASSWORD',
        'dev_password_123',
      ),
      name: this.configService.get<string>('DB_NAME', 'antereon'),
    };
  }

  private getSecurityConfig() {
    return {
      jwtSecret: this.configService.get<string>('JWT_SECRET', 'dev-secret-key'),
      jwtExpiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '24h'),
      encryptionKey: this.configService.get<string>(
        'ENCRYPTION_KEY',
        'dev-encryption-key',
      ),
    };
  }

  private getServerConfig() {
    return {
      port: this.configService.get<number>('PORT', 3000),
      corsOrigin: this.configService.get<string>(
        'CORS_ORIGIN',
        'http://localhost:5173',
      ),
    };
  }

  private getProvidersConfig() {
    return {
      virustotal: {
        baseUrl: 'https://www.virustotal.com/vtapi/v2',
        timeout: 10000,
      },
      abuseipdb: {
        baseUrl: 'https://api.abuseipdb.com/api/v2',
        timeout: 10000,
      },
      alienvault: {
        baseUrl: 'https://otx.alienvault.com/api/v1',
        timeout: 10000,
      },
    };
  }
}
