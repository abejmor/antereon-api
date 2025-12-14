import { Config } from '../secrets.types';

export const testConfig: Partial<Config> = {
  database: {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'dev_password_123',
    name: 'antereon',
    synchronize: true,
    logging: false,
    dropSchema: false,
  },
  security: {
    jwtSecret: 'test-jwt-secret-key',
    jwtExpiresIn: '1h',
    encryptionKey: 'test-encryption-key-32-chars-long',
  },
  server: {
    port: 3001,
    corsOrigin: 'http://localhost:3000',
  },
  providers: {
    virustotal: {
      baseUrl: 'https://www.virustotal.com/vtapi/v2',
      timeout: 5000,
    },
    abuseipdb: {
      baseUrl: 'https://api.abuseipdb.com/api/v2',
      timeout: 5000,
    },
    alienvault: {
      baseUrl: 'https://otx.alienvault.com/api/v1',
      timeout: 5000,
    },
  },
};
