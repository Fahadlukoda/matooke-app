import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
} from 'react-native';
import { theme } from '@/theme';

type Variant = keyof typeof theme.type;

type Props = RNTextProps & {
  variant?: Variant;
  color?: string;
  tabular?: boolean;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

export function Text({
  variant = 'bodyM',
  color,
  tabular = false,
  align,
  style,
  children,
  ...rest
}: Props) {
  const variantStyle = theme.type[variant];
  const resolvedColor = color ?? theme.semantic.text.primary;

  return (
    <RNText
      {...rest}
      style={[
        variantStyle as StyleProp<TextStyle>,
        { color: resolvedColor },
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    >
      {children}
    </RNText>
  );
}