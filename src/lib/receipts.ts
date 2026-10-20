import { supabase } from './supabase';
import type { PaymentMethod, PaymentStatus } from './payments';

export type ReceiptEvent = {
  id: string;
  title: string;
  start_at: string;
  venue_name: string;
  type: 'marathon' | 'training';
};

export type ReceiptRegistration = {
  id: string;
  distance_km: number;
  status: 'pending' | 'paid' | 'confirmed' | 'cancelled' | 'refunded';
  bib: string | null;
  event: ReceiptEvent;
};

export type Receipt = {
  id: string;
  amount_ugx: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod | 'card' | null;
  phone: string | null;
  provider: 'mock' | 'pesapal' | 'dgateway';
  provider_ref: string | null;
  merchant_reference: string;
  receipt_url: string | null;
  created_at: string;
  registration: ReceiptRegistration;
};

export async function fetchReceipt(paymentId: string): Promise<Receipt> {
  const { data, error } = await supabase
    .from('payments')
    .select(
      `
      id,
      amount_ugx,
      currency,
      status,
      method,
      phone,
      provider,
      provider_ref,
      merchant_reference,
      receipt_url,
      created_at,
      registration:event_registrations!payments_registration_id_fkey (
        id,
        distance_km,
        status,
        bib,
        event:events!event_registrations_event_id_fkey (
          id,
          title,
          start_at,
          venue_name,
          type
        )
      )
    `
    )
    .eq('id', paymentId)
    .single();

  if (error) throw error;
  return data as unknown as Receipt;
}