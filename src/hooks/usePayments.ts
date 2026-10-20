import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  initiatePayment,
  fetchPayment,
  fetchPaymentByRegistration,
  fetchMyReceipts,
  type Payment,
  type InitiatePaymentResponse,
  type PaymentMethod,
} from '@/lib/payments';

export const paymentKey = (id: string) => ['payment', id] as const;
export const paymentByRegKey = (registrationId: string) =>
  ['payment', 'registration', registrationId] as const;
export const myReceiptsKey = ['payments', 'receipts'] as const;

export function usePayment(id: string | undefined) {
  return useQuery<Payment>({
    queryKey: id ? paymentKey(id) : ['payment', 'none'],
    queryFn: () => fetchPayment(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'succeeded' || data.status === 'failed')) {
        return false;
      }
      return 2000;
    },
  });
}

export function usePaymentByRegistration(registrationId: string | undefined) {
  return useQuery<Payment | null>({
    queryKey: registrationId
      ? paymentByRegKey(registrationId)
      : ['payment', 'registration', 'none'],
    queryFn: () => fetchPaymentByRegistration(registrationId!),
    enabled: Boolean(registrationId),
  });
}

export function useMyReceipts() {
  return useQuery<Payment[]>({
    queryKey: myReceiptsKey,
    queryFn: fetchMyReceipts,
    staleTime: 1000 * 60,
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      registrationId: string;
      method: PaymentMethod;
      phone: string;
    }) => initiatePayment(input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: paymentKey(data.payment_id),
      });
      queryClient.invalidateQueries({
        queryKey: paymentByRegKey(variables.registrationId),
      });
    },
  });
}