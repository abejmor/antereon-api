import { ApiProperty } from '@nestjs/swagger';

export class DecryptedApiKeyResponseDto {
  @ApiProperty({ description: 'The decrypted API key' })
  apiKey: string;

  @ApiProperty({ description: 'Integration ID' })
  integrationId: string;

  @ApiProperty({ description: 'Provider name' })
  provider: string;
}
