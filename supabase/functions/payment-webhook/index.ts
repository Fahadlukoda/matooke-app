// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { MockProvider } from '../_shared/mock-provider.ts';
import { PesapalProvider } from '../_shared/pesapal-provider.ts';
import type { PaymentProvider } from '../_shared/payment-provider.ts';
import { selectProvider } from '../_shared/payment-provider.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PROVIDER_NAME = Deno.env.get('PAYMENT_PROVIDER') ?? 'mock';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function getProvider(): PaymentProvider {
  switch (selectProvider(PROVIDER_NAME)) {
    case 'pesapal':
      return new PesapalProvider();
    default:
      return new MockProvider();
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('method_not_allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  const rawBody = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((v: string, k: string) => {
    headers[k.toLowerCase()] = v;
  });
  const url = new URL(req.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((v: string, k: string) => {
    query[k] = v;
  });

  const provider = getProvider();
  const verification = await provider.verifyWebhook({ rawBody, headers, query });

  if (!verification.ok) {
    return new Response(
      JSON.stringify({ error: 'verification_failed', reason: verification.reason }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: payment, error: fetchErr } = await admin
    .from('payments')
    .select('id, status, amount_ugx, registration_id')
    .eq('merchant_reference', verification.merchantReference)
    .single();

  if (fetchErr || !payment) {
    return new Response(JSON.stringify({ error: 'payment_not_found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  if (payment.status === 'succeeded') {
    return new Response(JSON.stringify({ ok: true, idempotent: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const update: Record<string, unknown> = {
    status: verification.status,
    raw_callback: verification.raw,
  };
  if (verification.providerRef) update.provider_ref = verification.providerRef;

  const { error: updateErr } = await admin
    .from('payments')
    .update(update)
    .eq('id', payment.id);

  if (updateErr) {
    return new Response(
      JSON.stringify({ error: 'update_failed', detail: updateErr.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  return new Response(JSON.stringify({ ok: true, status: verification.status }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
});