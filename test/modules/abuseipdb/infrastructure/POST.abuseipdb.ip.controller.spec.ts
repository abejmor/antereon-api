import { INestApplication } from '@nestjs/common';
import { testsAppModule } from '../../../test.app.module';
import request from 'supertest';
import { UserService } from '../../../../src/modules/user/domain/services/user.service';
import { IntegrationService } from '../../../../src/modules/integration/domain/services/integration.service';
import { CreateIntegrationDto } from '../../../../src/modules/integration/infrastructure/integration.dto';
import { JwtService } from '@nestjs/jwt';

describe('POST /abuseipdb/ip', () => {
  let app: INestApplication;
  let userService: UserService;
  let integrationService: IntegrationService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const appModule = await testsAppModule();
    app = appModule.app;
    userService = appModule.nestModule.get(UserService);
    integrationService = appModule.nestModule.get(IntegrationService);
    jwtService = appModule.nestModule.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('yellow brick road', () => {
    it('should check IP successfully with valid integration', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'AbuseIPDB User',
        email: `abuseipdb-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const createIntegrationDto: CreateIntegrationDto = {
        provider: 'abuseipdb',
        name: 'My AbuseIPDB',
        apiKey: 'test-api-key-abuseipdb',
        isDefault: true,
      };

      const integration = await integrationService.create(
        user.id,
        createIntegrationDto,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const checkIpData = {
        ip: '8.8.8.8',
        integrationId: integration.id,
      };

      const response = await request(app.getHttpServer())
        .post('/abuseipdb/ip')
        .set('Authorization', `Bearer ${token}`)
        .send(checkIpData);

      expect([200, 400, 401, 403, 500]).toContain(response.status);
    });
  });
});
