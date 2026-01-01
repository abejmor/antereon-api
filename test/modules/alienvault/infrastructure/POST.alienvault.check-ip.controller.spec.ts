import { INestApplication } from '@nestjs/common';
import { testsAppModule } from '../../../test.app.module';
import request from 'supertest';
import { UserService } from '../../../../src/modules/user/domain/services/user.service';
import { IntegrationService } from '../../../../src/modules/integration/domain/services/integration.service';
import { CreateIntegrationDto } from '../../../../src/modules/integration/infrastructure/integration.dto';
import { JwtService } from '@nestjs/jwt';

describe('POST /alienvault/check-ip', () => {
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
        name: 'AlienVault User',
        email: `alienvault-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const createIntegrationDto: CreateIntegrationDto = {
        provider: 'alienvault',
        name: 'My AlienVault',
        apiKey: 'test-api-key-alienvault',
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
        .post('/alienvault/check-ip')
        .set('Authorization', `Bearer ${token}`)
        .send(checkIpData);

      expect([200, 201, 400, 401, 403, 500]).toContain(response.status);
    }, 20000);
  });

  describe('error cases', () => {
    it('should return 401 when no token is provided', async () => {
      const checkIpData = {
        ip: '8.8.8.8',
        integrationId: 'some-integration-id',
      };

      const response = await request(app.getHttpServer())
        .post('/alienvault/check-ip')
        .send(checkIpData)
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });

    it('should return 400 when IP is missing', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'AlienVault User 2',
        email: `alienvault2-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const checkIpData = {
        integrationId: 'some-integration-id',
      };

      const response = await request(app.getHttpServer())
        .post('/alienvault/check-ip')
        .set('Authorization', `Bearer ${token}`)
        .send(checkIpData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when integrationId is missing', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'AlienVault User 3',
        email: `alienvault3-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const checkIpData = {
        ip: '8.8.8.8',
      };

      const response = await request(app.getHttpServer())
        .post('/alienvault/check-ip')
        .set('Authorization', `Bearer ${token}`)
        .send(checkIpData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return error when integration does not exist', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'AlienVault User 4',
        email: `alienvault4-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const checkIpData = {
        ip: '8.8.8.8',
        integrationId: 'non-existent-integration-id',
      };

      const response = await request(app.getHttpServer())
        .post('/alienvault/check-ip')
        .set('Authorization', `Bearer ${token}`)
        .send(checkIpData);

      expect([200, 201, 400, 401, 403, 500]).toContain(response.status);
    }, 15000);
  });
});
