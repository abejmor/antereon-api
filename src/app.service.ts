import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to the Antereon API!';
  }

  getHealthStatus(): { status: string } {
    return { status: 'ok' };
  }
}
