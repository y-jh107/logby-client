import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const MOCK_POSTS = [
  { id: '1', date: '2026. 06. 14', preview: '오늘 처음으로 혼자 카페에서 책을 읽었다.' },
  { id: '2', date: '2026. 06. 13', preview: '드디어 프로젝트 마무리. 6주간의 기록이 결실을 맺었다.' },
  { id: '3', date: '2026. 06. 11', preview: '아침 루틴을 바꿨더니 집중력이 눈에 띄게 달라졌다.' },
];

export default function ProfileScreen() {
  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 헤더 */}
        <View className="px-6 pt-2 pb-4 border-b border-border flex-row items-center justify-between">
          <Text className="text-xl font-bold text-primary tracking-tight">
            프로필
          </Text>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <Text className="text-sm text-secondary">로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* 유저 정보 */}
        <View className="px-6 py-8 border-b border-border">
          <View className="w-16 h-16 rounded-full bg-surface border border-border items-center justify-center mb-4">
            <Text className="text-2xl font-light text-secondary">김</Text>
          </View>
          <Text className="text-lg font-bold text-primary">김민준</Text>
          <Text className="text-sm text-secondary mt-1">
            hello@example.com
          </Text>

          {/* 통계 */}
          <View className="flex-row mt-6 gap-x-8">
            <View>
              <Text className="text-xl font-bold text-primary">23</Text>
              <Text className="text-xs text-secondary mt-0.5">기록</Text>
            </View>
            <View>
              <Text className="text-xl font-bold text-primary">14</Text>
              <Text className="text-xs text-secondary mt-0.5">팔로워</Text>
            </View>
            <View>
              <Text className="text-xl font-bold text-primary">9</Text>
              <Text className="text-xs text-secondary mt-0.5">팔로잉</Text>
            </View>
          </View>
        </View>

        {/* 내 기록 */}
        <View className="px-6 pt-6">
          <Text className="text-xs font-medium text-secondary uppercase tracking-widest mb-4">
            내 기록
          </Text>
          {MOCK_POSTS.map((post) => (
            <TouchableOpacity
              key={post.id}
              className="py-4 border-b border-border"
              activeOpacity={0.7}
            >
              <Text className="text-xs text-secondary mb-1">{post.date}</Text>
              <Text className="text-sm text-primary leading-relaxed">
                {post.preview}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
