import { supabase } from './supabase';

export type PaymentMethod = 'mtn_momo' | 'airtel_money';

export type PaymentStatus =
  | 'initiated'
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded';

export type Payment = {
  id: string;
  user_id: string;
  registration_id: string;
  provider: 'mock' | 'pesapal' | 'dgateway';
  provider_ref: string | null;
  merchant_reference: string;
  amount_ugx: number;
  currency: string;
  method: PaymentMethod | 'card' | null;
  phone: string | null;
  status: PaymentStatus;
  receipt_url: string | null;
  raw_callback: unknown;
  created_at: string;
  updated_at: string;
};

export type InitiatePaymentResponse = {
  payment_id: string;
  provider_ref: string;
  merchant_reference: string;
  redirect_url: string;
};

export async function initiatePayment(input: {
  registrationId: string;
  method: PaymentMethod;
  phone: string;
}): Promise<InitiatePaymentResponse> {
  const { data, error } = await supabase.functions.invoke<InitiatePaymentResponse>(
    'initiate-payment',
    {
      body: {
        registration_id: input.registrationId,
        method: input.method,
        phone: input.phone,
      },
    }
  );

  if (error) throw error;
  if (!data) throw new Error('empty_response');
  return data;
}

export async function fetchPayment(id: string): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Payment;
}

export async function fetchPaymentByRegistration(
  registrationId: string
): Promise<Payment | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('registration_id', registrationId)
    .in('status', ['initiated', 'pending', 'succeeded', 'failed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as Payment) ?? null;
}

export async function fetchMyReceipts(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .in('status', ['succeeded', 'refunded'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Payment[];
}

export async function simulateWebhook(input: {
  merchantReference: string;
  providerRef: string;
  status: 'succeeded' | 'failed';
  amountUgx: number;
  method: PaymentMethod;
  phone: string;
}): Promise<void> {
  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/payment-webhook`;
  const payload = {
    merchant_reference: input.merchantReference,
    provider_ref: input.providerRef,
    status: input.status,
    amount: input.amountUgx,
    method: input.method,
    phone: input.phone,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`webhook_simulate_failed: ${response.status} ${text}`);
  }
}

export function formatUgx(amount: number): string {
  return `UGX ${amount.toLocaleString('en-UG')}`;
}

export function methodLabel(method: PaymentMethod | 'card' | null): string {
  if (method === 'mtn_momo') return 'MTN MoMo';
  if (method === 'airtel_money') return 'Airtel Money';
  if (method === 'card') return 'Card';
  return '—';
}

export function statusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'initiated':
      return 'Started';
    case 'pending':
      return 'Awaiting confirmation';
    case 'succeeded':
      return 'Paid';
    case 'failed':
      return 'Failed';
    case 'refunded':
      return 'Refunded';
  }
}