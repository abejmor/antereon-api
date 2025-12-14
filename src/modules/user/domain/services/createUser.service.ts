import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from '@/modules/auth/infrastructure/auth.dto';
import { User } from '../user.entity';
import { UserRepository } from '../user.repository';
import { UserFactory } from '../user.factory';

@Injectable()
export class CreateUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userFactory: UserFactory,
  ) {}

  async createUser(
    registerInformation: RegisterDto,
  ): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findByEmail(
      registerInformation.email,
    );

    if (existingUser) {
      throw new ConflictException('user already exists');
    }

    const user = await this.userFactory.createUser(registerInformation);

    const createdUser = await this.userRepository.create(user);

    // eslint-disable-next-line
    const { password, ...result } = createdUser;
    return result;
  }
}
