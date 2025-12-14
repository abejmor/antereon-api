import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserService } from './domain/services/createUser.service';
import { UserFactory } from './domain/user.factory';
import { UserRepository } from './domain/user.repository';
import { FindUserByEmailService } from './domain/services/findUserByEmail.service';
import { UserService } from './domain/user.service';
import { User } from './domain/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    CreateUserService,
    UserFactory,
    UserRepository,
    FindUserByEmailService,
    UserService,
  ],
  exports: [
    CreateUserService,
    FindUserByEmailService,
    UserService,
    UserRepository,
  ],
})
export class UserModule {}
