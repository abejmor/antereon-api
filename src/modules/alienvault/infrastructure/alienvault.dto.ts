import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AlienVaultCheckIpDto {
  @ApiProperty({ example: '8.8.8.8' })
  @IsString()
  @IsNotEmpty()
  ip: string;

  @ApiProperty({ example: 'integration-uuid' })
  @IsString()
  @IsNotEmpty()
  integrationId: string;
}

export class CheckDomainDto {
  @ApiProperty({ example: 'google.com' })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({ example: 'integration-uuid' })
  @IsString()
  @IsNotEmpty()
  integrationId: string;
}

export class CheckHashDto {
  @ApiProperty({ example: 'd41d8cd98f00b204e9800998ecf8427e' })
  @IsString()
  @IsNotEmpty()
  hash: string;

  @ApiProperty({ example: 'integration-uuid' })
  @IsString()
  @IsNotEmpty()
  integrationId: string;
}

export class CheckUrlDto {
  @ApiProperty({ example: 'https://example.com' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'integration-uuid' })
  @IsString()
  @IsNotEmpty()
  integrationId: string;
}

export class AlienVaultResponse {
  @ApiProperty({ example: 'alienvault' })
  provider: string;

  @ApiProperty({ example: 'success' })
  status: 'success' | 'error';

  @ApiPropertyOptional({ description: 'Response data from AlienVault OTX' })
  apiData?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Error message if status is error' })
  error?: string;

  @ApiProperty({ example: '2025-08-29T14:28:27.461Z' })
  analysisTimestamp: string;
}
