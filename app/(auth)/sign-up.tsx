import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { signUp } from '../../src/features/auth/api';
import { validateCredentials, type CredentialErrors } from '../../src/features/auth/validation';
import { Brand, Button, TextField } from '../../src/components/ui';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<CredentialErrors>({});
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const e = validateCredentials(email, password);
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setMessage(null);
    const { data, error } = await signUp(email, password);
    setLoading(false);
    if (error) setMessage({ text: error.message, error: true });
    else if (!data.session) setMessage({ text: 'Check your email to confirm your account, then sign in.', error: false });
    // With a session, the auth gate sends the new user to onboarding.
  }

  return (
    <View className="flex-1 justify-center gap-4 bg-background p-6">
      <Brand />
      <Text className="text-3xl font-extrabold text-text">Create account</Text>
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={errors.email} />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
      {message ? <Text className={message.error ? 'text-danger' : 'text-muted'}>{message.text}</Text> : null}
      <Button title="Sign up" onPress={submit} loading={loading} />
      <Link href="/(auth)/sign-in" className="text-center text-accent">I already have an account</Link>
    </View>
  );
}
