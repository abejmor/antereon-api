import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/domain/services/user.service';
import { User } from '@/modules/user/domain/user.entity';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserResponseDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from '../../infrastructure/auth.dto';
import { plainToClass } from 'class-transformer';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private generateAuthResponse(user: User): AuthResponseDto {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: plainToClass(UserResponseDto, user),
      accessToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.userService.createUser(
      registerDto.name,
      registerDto.email,
      registerDto.password,
    );

    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.validatePassword(
      user,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('user not found');
    }

    return plainToClass(UserResponseDto, user);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateProfile(
      userId,
      updateProfileDto.name,
      updateProfileDto.email,
      updateProfileDto.theme,
    );

    return plainToClass(UserResponseDto, user);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    await this.userService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
