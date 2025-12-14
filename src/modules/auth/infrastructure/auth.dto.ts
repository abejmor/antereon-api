import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { Exclude } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty({ message: 'name cannot be empty' })
  @IsString({ message: 'name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'email cannot be empty' })
  @IsEmail({}, { message: 'email format is invalid' })
  email: string;

  @IsNotEmpty({ message: 'password cannot be empty' })
  @IsString({ message: 'password must be a string' })
  @MinLength(8, { message: 'password must have at least 8 characters' })
  password: string;
}

export class LoginDto {
  @IsNotEmpty({ message: 'email cannot be empty' })
  @IsEmail({}, { message: 'email format is invalid' })
  email: string;

  @IsNotEmpty({ message: 'password cannot be empty' })
  @IsString({ message: 'password must be a string' })
  password: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'email format is invalid' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'theme must be a string' })
  theme?: string;
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'current password cannot be empty' })
  @IsString({ message: 'current password must be a string' })
  currentPassword: string;

  @IsNotEmpty({ message: 'new password cannot be empty' })
  @IsString({ message: 'new password must be a string' })
  @MinLength(8, { message: 'new password must have at least 8 characters' })
  newPassword: string;
}

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  theme: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password?: string;
}

export class AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
}
