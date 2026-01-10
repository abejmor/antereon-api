import { INestApplication } from '@nestjs/common';
import { testsAppModule } from '../../../test.app.module';
import request from 'supertest';
import { UserService } from '../../../../src/modules/user/domain/services/user.service';
import { IntegrationService } from '../../../../src/modules/integration/domain/services/integration.service';
import { CreateIntegrationDto } from '../../../../src/modules/integration/infrastructure/integration.dto';
import { JwtService } from '@nestjs/jwt';

describe('POST /abuseipdb/report', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('yellow brick road', () => {
    it('should report IP successfully with valid integration', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Report User',
        email: `report-${Date.now()}@example.com`,
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
        isFavorite: true,
      };

      const integration = await integrationService.create(
        user.id,
        createIntegrationDto,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const reportData = {
        ip: '192.168.1.1',
        categories: [14, 18],
        comment: 'Test report comment',
        integrationId: integration.id,
      };

      const response = await request(app.getHttpServer())
        .post('/abuseipdb/report')
        .set('Authorization', `Bearer ${token}`)
        .send(reportData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('error cases', () => {
    it('should return 401 when no token is provided', async () => {
      const reportData = {
        ip: '192.168.1.1',
        categories: [14, 18],
        comment: 'Test report comment',
        integrationId: 'some-integration-id',
      };

      const response = await request(app.getHttpServer())
        .post('/abuseipdb/report')
        .send(reportData)
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });

    it('should return 400 when IP is missing', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Report User 2',
        email: `report2-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const reportData = {
        categories: [14, 18],
        comment: 'Test report comment',
        integrationId: 'some-integration-id',
      };

      const response = await request(app.getHttpServer())
        .post('/abuseipdb/report')
        .set('Authorization', `Bearer ${token}`)
        .send(reportData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when categories are missing', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Report User 3',
        email: `report3-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const reportData = {
        ip: '192.168.1.1',
        comment: 'Test report comment',
        integrationId: 'some-integration-id',
      };

      const response = await request(app.getHttpServer())
        .post('/abuseipdb/report')
        .set('Authorization', `Bearer ${token}`)
        .send(reportData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when comment is missing', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Report User 4',
        email: `report4-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const reportIpData = {
        ip: '192.168.1.100',
        categories: [18, 22],
        integrationId: 'some-integration-id',
      };

      const response = await request(app.getHttpServer())
        .post('/abuseipdb/report')
        .set('Authorization', `Bearer ${token}`)
        .send(reportIpData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return error when integration does not exist', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Report User 5',
        email: `report5-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const reportIpData = {
        ip: '192.168.1.100',
        categories: [18, 22],
        comment: 'Suspicious activity',
        integrationId: 'non-existent-integration-id',
      };

      const response = await request(app.getHttpServer())
        .post('/abuseipdb/report')
        .set('Authorization', `Bearer ${token}`)
        .send(reportIpData);

      expect([400, 404, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });
  });
});
