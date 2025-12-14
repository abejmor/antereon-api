import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.getOrThrow<string>('ENCRYPTION_KEY');
    this.logger.log('EncryptionService initialized with crypto-js');
  }

  encrypt(text: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(text, this.secretKey).toString();
      return encrypted;
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  decrypt(encryptedText: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error('Invalid encrypted data or wrong key');
      }

      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  testEncryption(): boolean {
    try {
      const testData = 'test-api-key-12345';
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted);
      const isValid = testData === decrypted;

      this.logger.log(`Encryption test ${isValid ? 'passed' : 'failed'}`);
      return isValid;
    } catch (error) {
      this.logger.error('Encryption test failed', error);
      return false;
    }
  }
}
