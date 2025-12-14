import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
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
    const { provider, name, apiKey, isDefault, configuration } =
      createIntegrationDto;

    if (isDefault) {
      await this.integrationRepository.update(
        { userId, provider },
        { isDefault: false },
      );
    }

    const encryptedApiKey = this.encryptionService.encrypt(apiKey);

    const integration = this.integrationRepository.create({
      provider,
      name,
      encryptedApiKey,
      isDefault: isDefault || false,
      configuration,
      userId,
    });

    const savedIntegration = await this.integrationRepository.save(integration);

    return this.toResponseDto(savedIntegration);
  }

  async findAllByUser(
    userId: string,
    filters?: ListIntegrationsInputDto,
  ): Promise<IntegrationResponseDto[]> {
    const whereConditions: Record<string, any> = { userId };

    if (filters) {
      if (filters.isActive && filters.isActive.length > 0) {
        const activeValues = filters.isActive.map((val) => {
          if (val === 'active') return true;
          if (val === 'inactive') return false;
          return val === 'true';
        });
        if (activeValues.length === 1) {
          whereConditions.isActive = activeValues[0];
        }
      }

      if (filters.provider && filters.provider.length > 0) {
        whereConditions.provider = In(filters.provider);
      }
    }

    const integrations = await this.integrationRepository.find({
      where: whereConditions,
      order: { createdAt: 'DESC' },
    });

    let filteredIntegrations = integrations;

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredIntegrations = integrations.filter(
        (integration) =>
          integration.name.toLowerCase().includes(searchTerm) ||
          integration.provider.toLowerCase().includes(searchTerm),
      );
    }

    return filteredIntegrations.map((integration) =>
      this.toResponseDto(integration),
    );
  }

  async findActiveByUser(userId: string): Promise<Integration[]> {
    return this.integrationRepository.find({
      where: { userId, isActive: true },
    });
  }

  async findByProviderAndUser(
    provider: string,
    userId: string,
  ): Promise<Integration | null> {
    const integration = await this.integrationRepository.findOne({
      where: { provider, userId, isActive: true, isDefault: true },
    });

    if (!integration) {
      const fallbackIntegration = await this.integrationRepository.findOne({
        where: { provider, userId, isActive: true },
      });

      if (!fallbackIntegration) {
        return null;
      }

      const decryptedApiKey = this.encryptionService.decrypt(
        fallbackIntegration.encryptedApiKey,
      );

      return {
        ...fallbackIntegration,
        apiKey: decryptedApiKey,
      } as Integration & { apiKey: string };
    }

    const decryptedApiKey = this.encryptionService.decrypt(
      integration.encryptedApiKey,
    );

    return {
      ...integration,
      apiKey: decryptedApiKey,
    } as Integration & { apiKey: string };
  }

  async findById(id: string, userId: string): Promise<IntegrationResponseDto> {
    const integration = await this.integrationRepository.findOne({
      where: { id, userId },
    });

    if (!integration) {
      throw new NotFoundException('integration not found');
    }

    return this.toResponseDto(integration);
  }

  async update(
    id: string,
    userId: string,
    updateIntegrationDto: UpdateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    const integration = await this.integrationRepository.findOne({
      where: { id, userId },
    });

    if (!integration) {
      throw new NotFoundException('integration not found');
    }
    if (updateIntegrationDto.isDefault) {
      await this.integrationRepository.update(
        { userId, provider: integration.provider, id: Not(id) },
        { isDefault: false },
      );
    }

    if (updateIntegrationDto.apiKey) {
      const currentApiKey = integration.encryptedApiKey
        ? this.encryptionService.decrypt(integration.encryptedApiKey)
        : null;

      if (currentApiKey !== updateIntegrationDto.apiKey) {
        integration.encryptedApiKey = this.encryptionService.encrypt(
          updateIntegrationDto.apiKey,
        );
      }
    }

    Object.assign(integration, {
      name: updateIntegrationDto.name,
      isActive: updateIntegrationDto.isActive,
      isDefault: updateIntegrationDto.isDefault,
      configuration: updateIntegrationDto.configuration,
    });

    const updatedIntegration =
      await this.integrationRepository.save(integration);

    return this.toResponseDto(updatedIntegration);
  }

  async delete(id: string, userId: string): Promise<void> {
    const integration = await this.integrationRepository.findOne({
      where: { id, userId },
    });

    if (!integration) {
      throw new NotFoundException('integration not found');
    }

    await this.integrationRepository.remove(integration);
  }

  async getDecryptedApiKey(id: string, userId: string): Promise<string> {
    const integration = await this.integrationRepository.findOne({
      where: { id, userId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return this.encryptionService.decrypt(integration.encryptedApiKey);
  }

  async getDecryptedApiKeyWithDetails(
    id: string,
    userId: string,
  ): Promise<{ apiKey: string; integrationId: string; provider: string }> {
    const integration = await this.integrationRepository.findOne({
      where: { id, userId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

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
    const integration = await this.integrationRepository.findOne({
      where: { id, userId },
    });

    if (!integration) {
      throw new NotFoundException('integration not found');
    }

    integration.isActive = !integration.isActive;
    const updatedIntegration =
      await this.integrationRepository.save(integration);

    return this.toResponseDto(updatedIntegration);
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
