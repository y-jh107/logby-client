import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);
  const setUserId = useAuthStore((s) => s.setUserId);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { data: loginRes } = await api.post('/api/auth/login', { email, password });
      await setToken(loginRes.data.accessToken);

      const { data: meRes } = await api.get('/api/users/me');
      setUserId(meRes.data.id);

      router.replace('/(tabs)/feed');
    } catch (err: any) {
      const message = err.response?.data?.message ?? '로그인 중 오류가 발생했습니다.';
      Alert.alert('로그인 실패', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-8 pt-24 pb-12">
          <View className="mb-16">
            <Text className="text-3xl font-bold text-primary tracking-tight">logby</Text>
            <Text className="text-sm text-secondary mt-1">당신의 순간을 기록하세요</Text>
          </View>

          <View className="gap-y-4">
            <View>
              <Text className="text-xs font-medium text-secondary mb-2 uppercase tracking-widest">
                이메일
              </Text>
              <TextInput
                className="border border-border rounded-xl px-4 py-3.5 text-sm text-primary bg-surface"
                placeholder="hello@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View>
              <Text className="text-xs font-medium text-secondary mb-2 uppercase tracking-widest">
                비밀번호
              </Text>
              <TextInput
                className="border border-border rounded-xl px-4 py-3.5 text-sm text-primary bg-surface"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                editable={!loading}
              />
            </View>
          </View>

          <TouchableOpacity
            className="bg-primary rounded-xl py-4 mt-8 items-center"
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white text-sm font-semibold tracking-wide">로그인</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-secondary">계정이 없으신가요? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity disabled={loading}>
                <Text className="text-sm font-semibold text-primary">회원가입</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
