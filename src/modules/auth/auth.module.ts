import { Module } from '@nestjs/common';
import { AuthController } from './infrastructure/auth.controller';
import { AuthService } from './domain/services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { SecretsModule } from '../secrets/secrets.module';
import { SecretsService } from '../secrets/secrets.service';

@Module({
  imports: [
    ConfigModule,
    SecretsModule,
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [SecretsModule],
      useFactory: (secretsService: SecretsService) => {
        const securityConfig = secretsService.getConfigSecrets('security');
        return {
          secret: securityConfig.jwtSecret,
          signOptions: {
            expiresIn: securityConfig.jwtExpiresIn,
          },
        };
      },
      inject: [SecretsService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
