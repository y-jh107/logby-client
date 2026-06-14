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

export default function SignupScreen() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);

  const handleSignup = async () => {
    if (!nickname.trim() || !email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/signup', { email, password, nickname });

      // 회원가입 성공 후 자동 로그인
      const { data: loginRes } = await api.post('/api/auth/login', { email, password });
      await setToken(loginRes.data.accessToken);
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      const message = err.response?.data?.message ?? '회원가입 중 오류가 발생했습니다.';
      Alert.alert('회원가입 실패', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-8 pt-24 pb-12">
          {/* 헤더 */}
          <View className="mb-12">
            <Text className="text-3xl font-bold text-primary tracking-tight">
              시작하기
            </Text>
            <Text className="text-sm text-secondary mt-1">
              무료로 계정을 만들어보세요
            </Text>
          </View>

          {/* 입력 폼 */}
          <View className="gap-y-4">
            <View>
              <Text className="text-xs font-medium text-secondary mb-2 uppercase tracking-widest">
                닉네임
              </Text>
              <TextInput
                className="border border-border rounded-xl px-4 py-3.5 text-sm text-primary bg-surface"
                placeholder="2~20자"
                placeholderTextColor="#9ca3af"
                value={nickname}
                onChangeText={setNickname}
                autoComplete="username"
                editable={!loading}
              />
            </View>

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
                placeholder="8자 이상"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
                editable={!loading}
              />
            </View>
          </View>

          {/* 회원가입 버튼 */}
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 mt-8 items-center"
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white text-sm font-semibold tracking-wide">
                계정 만들기
              </Text>
            )}
          </TouchableOpacity>

          {/* 로그인 링크 */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-secondary">이미 계정이 있으신가요? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity disabled={loading}>
                <Text className="text-sm font-semibold text-primary">
                  로그인
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
