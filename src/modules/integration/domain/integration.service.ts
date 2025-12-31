import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, ILike, FindManyOptions } from 'typeorm';
import { Integration } from './integration.entity';
import { EncryptionService } from './encryption.service';
import {
  CreateIntegrationDto,
  UpdateIntegrationDto,
  IntegrationResponseDto,
  ListIntegrationsInputDto,
} from '../infrastructure/integration.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class IntegrationService {
  constructor(
    @InjectRepository(Integration)
    private readonly integrationRepository: Repository<Integration>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(
    userId: string,
    createIntegrationDto: CreateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    const { provider, apiKey, isDefault } = createIntegrationDto;

    if (isDefault) {
      await this.unsetOtherDefaults(userId, provider);
    }

    const encryptedApiKey = this.encryptionService.encrypt(apiKey);

    const newIntegration = this.integrationRepository.create({
      ...createIntegrationDto,
      userId,
      encryptedApiKey,
      isDefault: !!isDefault,
    });

    const savedIntegration =
      await this.integrationRepository.save(newIntegration);
    return this.toResponseDto(savedIntegration);
  }

  async findAllByUser(
    userId: string,
    filters: ListIntegrationsInputDto = {},
  ): Promise<IntegrationResponseDto[]> {
    const { provider, isActive, search } = filters;

    const where: FindManyOptions<Integration>['where'] = { userId };

    if (provider?.length) {
      where.provider = In(provider);
    }

    if (isActive?.length === 1) {
      where.isActive = isActive[0] === 'active' || isActive[0] === 'true';
    }

    const findOptions: FindManyOptions<Integration> = {
      where,
      order: { createdAt: 'DESC' },
    };

    if (search) {
      const term = ILike(`%${search.toLowerCase()}%`);
      findOptions.where = [
        { ...where, name: term },
        { ...where, provider: term },
      ];
    }

    const integrations = await this.integrationRepository.find(findOptions);

    return integrations.map((i) => this.toResponseDto(i));
  }

  async findActiveByUser(userId: string): Promise<Integration[]> {
    return this.integrationRepository.find({
      where: { userId, isActive: true },
    });
  }

  async findById(id: string, userId: string): Promise<IntegrationResponseDto> {
    const integration = await this.getIntegrationOrFail(id, userId);
    return this.toResponseDto(integration);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    const integration = await this.getIntegrationOrFail(id, userId);

    if (dto.isDefault) {
      await this.unsetOtherDefaults(userId, integration.provider, id);
    }

    if (
      dto.apiKey &&
      dto.apiKey !== this.tryDecrypt(integration.encryptedApiKey)
    ) {
      integration.encryptedApiKey = this.encryptionService.encrypt(dto.apiKey);
    }

    const { apiKey: _apiKey, ...updateData } = dto;
    Object.assign(integration, updateData);

    const updated = await this.integrationRepository.save(integration);
    return this.toResponseDto(updated);
  }

  private async unsetOtherDefaults(
    userId: string,
    provider: string,
    excludeId?: string,
  ) {
    await this.integrationRepository.update(
      { userId, provider, ...(excludeId && { id: Not(excludeId) }) },
      { isDefault: false },
    );
  }

  private tryDecrypt(encrypted: string): string | null {
    try {
      return this.encryptionService.decrypt(encrypted);
    } catch {
      return null;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const integration = await this.getIntegrationOrFail(id, userId);
    await this.integrationRepository.remove(integration);
  }

  async getDecryptedApiKey(id: string, userId: string): Promise<string> {
    const integration = await this.getIntegrationOrFail(id, userId);
    return this.encryptionService.decrypt(integration.encryptedApiKey);
  }

  async getDecryptedApiKeyWithDetails(
    id: string,
    userId: string,
  ): Promise<{ apiKey: string; integrationId: string; provider: string }> {
    const integration = await this.getIntegrationOrFail(id, userId);

    const decryptedApiKey = this.encryptionService.decrypt(
      integration.encryptedApiKey,
    );

    return {
      apiKey: decryptedApiKey,
      integrationId: integration.id,
      provider: integration.provider,
    };
  }

  async toggleActive(
    id: string,
    userId: string,
  ): Promise<IntegrationResponseDto> {
    const integration = await this.getIntegrationOrFail(id, userId);

    integration.isActive = !integration.isActive;
    const updatedIntegration =
      await this.integrationRepository.save(integration);

    return this.toResponseDto(updatedIntegration);
  }

  private async getIntegrationOrFail(
    id: string,
    userId: string,
  ): Promise<Integration> {
    const integration = await this.integrationRepository.findOne({
      where: { id, userId },
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    return integration;
  }

  private toResponseDto(integration: Integration): IntegrationResponseDto {
    return plainToClass(IntegrationResponseDto, {
      id: integration.id,
      provider: integration.provider,
      name: integration.name,
      isActive: integration.isActive,
      isDefault: integration.isDefault,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    });
  }
}
