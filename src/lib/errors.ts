import type { AuthError } from '@supabase/supabase-js';

export function authErrorMessage(error: AuthError | null | undefined): string {
  if (!error) return 'Something went wrong. Try again.';

  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'Email or password is incorrect.';
  }
  if (message.includes('email not confirmed')) {
    return 'Check your email to confirm your account before signing in.';
  }
  if (message.includes('user already registered')) {
    return 'An account with this email already exists. Sign in instead.';
  }
  if (message.includes('password should be at least')) {
    return 'Password must be at least 8 characters.';
  }
  if (message.includes('unable to validate email')) {
    return 'That email address does not look right.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (message.includes('network')) {
    return 'No connection. Check your network and try again.';
  }

  return error.message;
}