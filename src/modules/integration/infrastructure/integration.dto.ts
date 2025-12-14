import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsObject,
  MaxLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateIntegrationDto {
  @ApiProperty({ description: 'provider name (e.g., virustotal, abuseipdb)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  provider: string;

  @ApiProperty({ description: 'custom name for the integration' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'API key for the provider' })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiPropertyOptional({
    description: 'set as default integration for this provider',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'additional provider configuration' })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;
}

export class UpdateIntegrationDto {
  @ApiPropertyOptional({ description: 'custom name for the integration' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'API key for the provider' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'whether the integration is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'set as default integration for this provider',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'additional provider configuration' })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;
}

export class ListIntegrationsInputDto {
  @ApiPropertyOptional({
    description: 'search term for integration name or provider',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'filter by active status',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value];
    }
    return Array.isArray(value) ? (value as string[]) : [];
  })
  isActive?: string[];

  @ApiPropertyOptional({
    description: 'filter by provider',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value];
    }
    return Array.isArray(value) ? (value as string[]) : [];
  })
  provider?: string[];
}

export class IntegrationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
