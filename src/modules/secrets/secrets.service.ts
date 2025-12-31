import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from './secrets.types';

@Injectable()
export class SecretsService {
  private readonly logger = new Logger(SecretsService.name);

  constructor(private configService: ConfigService) {
    this.logger.log(
      `Loaded configuration for environment: ${this.getRuntimeEnv()}`,
    );
  }

  public getRuntimeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
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
      corsOrigin: (() => {
        const origin = this.configService.get<string>('CORS_ORIGIN');
        if (origin) {
          return origin.split(',');
        }
        return ['http://localhost:5173'];
      })(),
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
