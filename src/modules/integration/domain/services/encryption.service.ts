import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly key: Buffer;
  private readonly alg = 'aes-256-gcm';

  constructor(private config: ConfigService) {
    const secret = this.config.getOrThrow<string>('ENCRYPTION_KEY');
    this.key = createHash('sha256').update(secret).digest();
  }

  encrypt(text: string): string {
    try {
      const iv = randomBytes(12);
      const cipher = createCipheriv(this.alg, this.key, iv);

      const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();

      return [iv, tag, encrypted].map((b) => b.toString('hex')).join('.');
    } catch (error) {
      this.logger.error('encryption error', error);
      throw new Error('encryption error');
    }
  }

  decrypt(hash: string): string {
    try {
      const [iv, tag, content] = hash
        .split('.')
        .map((p) => Buffer.from(p, 'hex'));

      const decipher = createDecipheriv(this.alg, this.key, iv);
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([
        decipher.update(content),
        decipher.final(),
      ]);
      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error('decryption error', error);
      throw new Error('decryption error');
    }
  }
}
