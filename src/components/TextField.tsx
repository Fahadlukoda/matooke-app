import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { theme } from '@/theme';
import { Text } from './Text';
import { InsetSurface } from './InsetSurface';

type Props = Omit<TextInputProps, 'style'> & {
  label?: string;
  labelIcon?: React.ReactNode;
  helper?: string;
  error?: string;
  multiline?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  {
    label,
    labelIcon,
    helper,
    error,
    multiline,
    containerStyle,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={containerStyle}>
      {label ? (
        <View style={styles.labelRow}>
          {labelIcon}
          <Text
            variant="caption"
            color={theme.semantic.text.secondary}
            style={styles.label}
          >
            {label}
          </Text>
        </View>
      ) : null}
      <InsetSurface
        radius={theme.radii.input}
        padding={0}
        style={{
          borderWidth: focused || hasError ? 1 : 0,
          borderColor: hasError
            ? theme.semantic.border.danger
            : focused
            ? theme.semantic.border.focus
            : 'transparent',
        }}
      >
        <TextInput
          ref={ref}
          {...rest}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={theme.textColors.ink[300]}
          style={[
            styles.input,
            multiline && styles.multiline,
            { color: theme.semantic.text.primary },
          ]}
        />
      </InsetSurface>
      {error ? (
        <Text variant="bodyS" color={theme.semantic.text.danger} style={styles.helper}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="bodyS" color={theme.semantic.text.secondary} style={styles.helper}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    marginBottom: 0,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.xs,
  },
  input: {
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  helper: {
    marginTop: theme.spacing.xs,
  },
});