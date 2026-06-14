import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: 인증 로직 연결
    router.replace('/(tabs)/feed');
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
          {/* 로고 */}
          <View className="mb-16">
            <Text className="text-3xl font-bold text-primary tracking-tight">
              logby
            </Text>
            <Text className="text-sm text-secondary mt-1">
              당신의 순간을 기록하세요
            </Text>
          </View>

          {/* 입력 폼 */}
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
              />
            </View>
          </View>

          {/* 로그인 버튼 */}
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 mt-8 items-center"
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text className="text-white text-sm font-semibold tracking-wide">
              로그인
            </Text>
          </TouchableOpacity>

          {/* 회원가입 링크 */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-secondary">계정이 없으신가요? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-semibold text-primary">
                  회원가입
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
