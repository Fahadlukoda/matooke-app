// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { MockProvider } from '../_shared/mock-provider.ts';
import { PesapalProvider } from '../_shared/pesapal-provider.ts';
import type { PaymentProvider, PaymentMethod } from '../_shared/payment-provider.ts';
import { selectProvider } from '../_shared/payment-provider.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PROVIDER_NAME = Deno.env.get('PAYMENT_PROVIDER') ?? 'mock';

function getProvider(): PaymentProvider {
  switch (selectProvider(PROVIDER_NAME)) {
    case 'pesapal':
      return new PesapalProvider();
    case 'dgateway':
      throw new Error('dgateway_not_configured');
    default:
      return new MockProvider();
  }
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors() });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'not_authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const jwt = authHeader.replace('Bearer ', '');
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ error: 'invalid_token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  let body: {
    registration_id?: string;
    method?: PaymentMethod;
    phone?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  const { registration_id, method, phone } = body;
  if (!registration_id || !method || !phone) {
    return new Response(
      JSON.stringify({ error: 'missing_fields', need: ['registration_id', 'method', 'phone'] }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...cors() } }
    );
  }
  if (!['mtn_momo', 'airtel_money'].includes(method)) {
    return new Response(JSON.stringify({ error: 'invalid_method' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('user_id', userData.user.id)
    .single();
  if (!profile) {
    return new Response(JSON.stringify({ error: 'profile_not_found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  const { data: registration, error: regErr } = await admin
    .from('event_registrations')
    .select('id, user_id, event_id, status, distance_km, events:event_id (id, title, is_paid, entry_fee_ugx)')
    .eq('id', registration_id)
    .single();

  if (regErr || !registration) {
    return new Response(JSON.stringify({ error: 'registration_not_found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }
  if (registration.user_id !== profile.id) {
    return new Response(JSON.stringify({ error: 'not_owner' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }
  if (registration.status !== 'pending') {
    return new Response(
      JSON.stringify({ error: 'registration_not_pending', status: registration.status }),
      { status: 409, headers: { 'Content-Type': 'application/json', ...cors() } }
    );
  }

  const event = (registration as any).events;
  if (!event || !event.is_paid || !event.entry_fee_ugx) {
    return new Response(JSON.stringify({ error: 'event_not_paid' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json', ...cors() },
    });
  }

  const { data: existing } = await admin
    .from('payments')
    .select('id, status, provider_ref, merchant_reference')
    .eq('registration_id', registration.id)
    .in('status', ['initiated', 'pending', 'succeeded'])
    .maybeSingle();

  if (existing) {
    if (existing.status === 'succeeded') {
      return new Response(JSON.stringify({ error: 'already_paid' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json', ...cors() },
      });
    }
    return new Response(
      JSON.stringify({
        payment_id: existing.id,
        provider_ref: existing.provider_ref,
        merchant_reference: existing.merchant_reference,
        already_initiated: true,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...cors() } }
    );
  }

  const merchantReference = `MTK-${registration.id.slice(0, 8)}-${Date.now()}`;

  const { data: payment, error: paymentErr } = await admin
    .from('payments')
    .insert({
      user_id: profile.id,
      registration_id: registration.id,
      provider: PROVIDER_NAME,
      merchant_reference: merchantReference,
      amount_ugx: event.entry_fee_ugx,
      currency: 'UGX',
      method,
      phone,
      status: 'initiated',
    })
    .select('id')
    .single();

  if (paymentErr || !payment) {
    return new Response(
      JSON.stringify({ error: 'payment_insert_failed', detail: paymentErr?.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...cors() } }
    );
  }

  const provider = getProvider();
  const callbackUrl = `${SUPABASE_URL}/functions/v1/payment-webhook`;

  let result;
  try {
    result = await provider.initiate({
      merchantReference,
      amountUgx: event.entry_fee_ugx,
      currency: 'UGX',
      method,
      phone,
      description: `${event.title} — ${registration.distance_km}k`,
      callbackUrl,
      cancelUrl: callbackUrl,
    });
  } catch (e) {
    await admin
      .from('payments')
      .update({
        status: 'failed',
        raw_callback: { error: String(e) },
      })
      .eq('id', payment.id);

    return new Response(
      JSON.stringify({ error: 'provider_initiate_failed', detail: String(e) }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...cors() } }
    );
  }

  await admin
    .from('payments')
    .update({
      provider_ref: result.providerRef,
      status: 'pending',
    })
    .eq('id', payment.id);

  await admin
    .from('event_registrations')
    .update({ payment_id: payment.id })
    .eq('id', registration.id);

  return new Response(
    JSON.stringify({
      payment_id: payment.id,
      provider_ref: result.providerRef,
      merchant_reference: merchantReference,
      redirect_url: result.redirectUrl,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...cors() } }
  );
});