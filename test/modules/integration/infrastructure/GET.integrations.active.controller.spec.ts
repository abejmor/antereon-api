import { INestApplication } from '@nestjs/common';
import { testsAppModule } from '../../../test.app.module';
import request from 'supertest';
import { UserService } from '../../../../src/modules/user/domain/user.service';
import { IntegrationService } from '../../../../src/modules/integration/domain/integration.service';
import { JwtService } from '@nestjs/jwt';

describe('GET /integrations/active', () => {
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
    it('should return only active integrations', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Test User Active',
        email: `active-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const activeIntegration = await integrationService.create(user.id, {
        provider: 'virustotal',
        name: 'Active VirusTotal API',
        apiKey: 'test-key-active',
        isDefault: true,
      });

      const inactiveIntegration = await integrationService.create(user.id, {
        provider: 'abuseipdb',
        name: 'Inactive AbuseIPDB API',
        apiKey: 'test-key-inactive',
        isDefault: false,
      });

      await integrationService.toggleActive(inactiveIntegration.id, user.id);

      const response = await request(app.getHttpServer())
        .get('/integrations/active')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);

      expect((response.body as any[])[0]).toMatchObject({
        id: activeIntegration.id,
        provider: 'virustotal',
        name: 'Active VirusTotal API',
        isActive: true,
        isDefault: true,
      });

      expect((response.body as any[])[0]).toHaveProperty(
        'id',
        activeIntegration.id,
      );
      expect((response.body as any[])[0]).not.toHaveProperty('apiKey');
      expect((response.body as any[])[0]).not.toHaveProperty('encryptedApiKey');
    });

    it('should return empty array when user has no active integrations', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Test User No Active',
        email: `no-active-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const integration = await integrationService.create(user.id, {
        provider: 'virustotal',
        name: 'Inactive Integration',
        apiKey: 'test-key',
        isDefault: false,
      });

      await integrationService.toggleActive(integration.id, user.id);

      const response = await request(app.getHttpServer())
        .get('/integrations/active')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('error cases', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/integrations/active')
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/integrations/active')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });
  });
});
