import type {
  PaymentProvider,
  InitiateInput,
  InitiateResult,
  WebhookVerificationInput,
  WebhookVerificationResult,
} from './payment-provider.ts';

export class MockProvider implements PaymentProvider {
  readonly name = 'mock' as const;

  async initiate(input: InitiateInput): Promise<InitiateResult> {
    const providerRef = `MOCK-${crypto.randomUUID()}`;
    const params = new URLSearchParams({
      merchant_reference: input.merchantReference,
      provider_ref: providerRef,
      amount: String(input.amountUgx),
      method: input.method,
      phone: input.phone,
      callback: input.callbackUrl,
    });
    const redirectUrl = `${input.callbackUrl.replace(
      '/payment-webhook',
      '/mock-checkout'
    )}?${params.toString()}`;
    return { providerRef, redirectUrl };
  }

  async verifyWebhook(
    input: WebhookVerificationInput
  ): Promise<WebhookVerificationResult> {
    let parsed: any;
    try {
      parsed = JSON.parse(input.rawBody);
    } catch {
      return { ok: false, reason: 'invalid_json' };
    }

    const merchantReference =
      typeof parsed.merchant_reference === 'string' ? parsed.merchant_reference : null;
    if (!merchantReference) {
      return { ok: false, reason: 'missing_merchant_reference' };
    }

    const status: 'succeeded' | 'failed' | 'pending' =
      parsed.status === 'succeeded'
        ? 'succeeded'
        : parsed.status === 'failed'
        ? 'failed'
        : 'pending';

    return {
      ok: true,
      merchantReference,
      providerRef: typeof parsed.provider_ref === 'string' ? parsed.provider_ref : null,
      status,
      method:
        parsed.method === 'mtn_momo' || parsed.method === 'airtel_money' || parsed.method === 'card'
          ? parsed.method
          : null,
      phone: typeof parsed.phone === 'string' ? parsed.phone : null,
      amountUgx: typeof parsed.amount === 'number' ? parsed.amount : null,
      raw: parsed,
    };
  }
}