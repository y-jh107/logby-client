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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    // TODO: 회원가입 로직 연결
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
                이름
              </Text>
              <TextInput
                className="border border-border rounded-xl px-4 py-3.5 text-sm text-primary bg-surface"
                placeholder="홍길동"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                autoComplete="name"
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
              />
            </View>

            <View>
              <Text className="text-xs font-medium text-secondary mb-2 uppercase tracking-widest">
                비밀번호
              </Text>
              <TextInput
                className="border border-border rounded-xl px-4 py-3.5 text-sm text-primary bg-surface"
                placeholder="8자 이상 입력"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>
          </View>

          {/* 회원가입 버튼 */}
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 mt-8 items-center"
            onPress={handleSignup}
            activeOpacity={0.85}
          >
            <Text className="text-white text-sm font-semibold tracking-wide">
              계정 만들기
            </Text>
          </TouchableOpacity>

          {/* 로그인 링크 */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-secondary">이미 계정이 있으신가요? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
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
