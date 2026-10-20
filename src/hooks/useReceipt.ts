import { useQuery } from '@tanstack/react-query';
import { fetchReceipt, type Receipt } from '@/lib/receipts';

export const receiptKey = (paymentId: string) => ['receipt', paymentId] as const;

export function useReceipt(paymentId: string | undefined) {
  return useQuery<Receipt>({
    queryKey: paymentId ? receiptKey(paymentId) : ['receipt', 'none'],
    queryFn: () => fetchReceipt(paymentId!),
    enabled: Boolean(paymentId),
    staleTime: 1000 * 60 * 5,
  });
}