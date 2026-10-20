import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';

/**
 * Top inset for screen headers.
 * On native: real status-bar inset from safe-area-context.
 * On web: no real status bar, so use a fixed breathing gap so heroes don't kiss the top edge.
 */
export function useTopInset(): number {
  const insets = useSafeAreaInsets();
  if (Platform.OS === 'web') return theme.spacing.md;
  return insets.top;
}
