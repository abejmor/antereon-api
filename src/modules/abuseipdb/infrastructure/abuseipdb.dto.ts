import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsNumber } from 'class-validator';

export class AbuseIpCheckDto {
  @ApiProperty({ description: 'IP address to check' })
  @IsString()
  @IsNotEmpty()
  ip: string;

  @ApiProperty({ description: 'Integration ID' })
  @IsString()
  @IsNotEmpty()
  integrationId: string;
}

export class ReportIpDto {
  @ApiProperty({ description: 'IP address to report' })
  @IsString()
  @IsNotEmpty()
  ip: string;

  @ApiProperty({ description: 'Abuse categories', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  categories: number[];

  @ApiProperty({ description: 'Comment about the abuse' })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiProperty({ description: 'Integration ID' })
  @IsString()
  @IsNotEmpty()
  integrationId: string;
}

export class AbuseIPDBResponse {
  @ApiProperty({ example: 'abuseipdb' })
  provider: string;

  @ApiProperty({ example: 'success' })
  status: 'success' | 'error';

  @ApiPropertyOptional({ description: 'Response data from AbuseIPDB' })
  apiData?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Error message if status is error' })
  error?: string;

  @ApiProperty({ example: '2025-08-29T14:28:27.461Z' })
  analysisTimestamp: string;
}
