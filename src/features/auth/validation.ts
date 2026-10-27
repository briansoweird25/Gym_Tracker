export type CredentialErrors = { email?: string; password?: string };

export function validateCredentials(email: string, password: string): CredentialErrors {
  const errors: CredentialErrors = {};
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email address';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  return errors;
}
