import type {
  PaymentProvider,
  InitiateInput,
  InitiateResult,
  WebhookVerificationInput,
  WebhookVerificationResult,
} from './payment-provider.ts';

export class PesapalProvider implements PaymentProvider {
  readonly name = 'pesapal' as const;

  async initiate(_input: InitiateInput): Promise<InitiateResult> {
    throw new Error(
      'pesapal_not_configured: Pesapal sandbox credentials are not yet available. Set PAYMENT_PROVIDER=mock in Supabase Edge Function secrets to use the mock provider.'
    );
  }

  async verifyWebhook(
    _input: WebhookVerificationInput
  ): Promise<WebhookVerificationResult> {
    return { ok: false, reason: 'pesapal_not_configured' };
  }
}