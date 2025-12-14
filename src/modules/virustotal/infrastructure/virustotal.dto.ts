export interface AnalyzeUrlDto {
  url: string;
  integrationId: string;
}

export interface CheckIpDto {
  ip: string;
  integrationId: string;
}

export interface CheckDomainDto {
  domain: string;
  integrationId: string;
}

export interface CheckHashDto {
  hash: string;
  integrationId: string;
}

export interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

export interface VirusTotalResponse {
  provider: string;
  status: 'success' | 'error';
  apiData?: Record<string, unknown>;
  error?: string;
  analysisTimestamp: string;
}
