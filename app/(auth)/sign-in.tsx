import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { signIn } from '../../src/features/auth/api';
import { validateCredentials, type CredentialErrors } from '../../src/features/auth/validation';
import { Brand, Button, TextField } from '../../src/components/ui';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<CredentialErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const e = validateCredentials(email, password);
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setFormError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setFormError(error.message);
  }

  return (
    <View className="flex-1 justify-center gap-4 bg-background p-6">
      <Brand />
      <Text className="text-3xl font-extrabold text-text">Welcome back</Text>
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={errors.email} />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
      {formError ? <Text className="text-danger">{formError}</Text> : null}
      <Button title="Sign in" onPress={submit} loading={loading} />
      <Link href="/(auth)/sign-up" className="text-center text-accent">Create an account</Link>
    </View>
  );
}
