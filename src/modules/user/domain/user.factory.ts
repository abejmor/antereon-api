import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { RegisterDto } from '@/modules/auth/infrastructure/auth.dto';

@Injectable()
export class UserFactory {
  async createUser(registerInformation: RegisterDto): Promise<User> {
    const saltSecurityGenerator = 10;

    const passwordHashed = await bcrypt.hash(
      registerInformation.password,
      saltSecurityGenerator,
    );

    const user = new User();
    user.email = registerInformation.email;
    user.password = passwordHashed;

    return user;
  }
}
