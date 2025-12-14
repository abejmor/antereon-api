import { INestApplication } from '@nestjs/common';
import { testsAppModule } from '../../../test.app.module';
import request from 'supertest';

describe('PUT /auth/profile/password', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { app: testApp } = await testsAppModule();
    app = testApp;
  }, 10000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('yellow brick road', () => {
    it('should exist and respond', async () => {
      const response = await request(app.getHttpServer())
        .put('/auth/profile/password')
        .send({});

      expect([400, 401, 500]).toContain(response.status);
    });
  });
});
