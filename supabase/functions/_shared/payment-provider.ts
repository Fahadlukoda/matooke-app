export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'card';

export type InitiateInput = {
  merchantReference: string;
  amountUgx: number;
  currency: 'UGX';
  method: PaymentMethod;
  phone: string;
  description: string;
  callbackUrl: string;
  cancelUrl: string;
};

export type InitiateResult = {
  providerRef: string;
  redirectUrl: string;
};

export type WebhookVerificationInput = {
  rawBody: string;
  headers: Record<string, string>;
  query: Record<string, string>;
};

export type WebhookVerificationResult =
  | { ok: true; merchantReference: string; providerRef: string | null; status: 'succeeded' | 'failed' | 'pending'; method: PaymentMethod | null; phone: string | null; amountUgx: number | null; raw: unknown }
  | { ok: false; reason: string };

export interface PaymentProvider {
  readonly name: 'mock' | 'pesapal' | 'dgateway';
  initiate(input: InitiateInput): Promise<InitiateResult>;
  verifyWebhook(input: WebhookVerificationInput): Promise<WebhookVerificationResult>;
}

export function selectProvider(name: string | undefined): 'mock' | 'pesapal' | 'dgateway' {
  if (name === 'pesapal') return 'pesapal';
  if (name === 'dgateway') return 'dgateway';
  return 'mock';
}