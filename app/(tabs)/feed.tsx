import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

const MOCK_POSTS = [
  { id: '1', author: '김민준', time: '3분 전', content: '오늘 처음으로 혼자 카페에서 책을 읽었다. 생각보다 괜찮은 하루.' },
  { id: '2', author: '이서연', time: '1시간 전', content: '드디어 프로젝트 마무리. 6주간의 기록이 결실을 맺었다.' },
  { id: '3', author: '박지훈', time: '2시간 전', content: '아침 루틴을 바꿨더니 집중력이 눈에 띄게 달라졌다. 작은 변화의 힘.' },
  { id: '4', author: '최수아', time: '어제', content: '처음 도전한 요리. 실패해도 괜찮다는 걸 다시 배웠다.' },
];

export default function FeedScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="px-6 pt-2 pb-4 border-b border-border flex-row items-center justify-between">
        <Text className="text-xl font-bold text-primary tracking-tight">
          logby
        </Text>
        <TouchableOpacity className="w-8 h-8 rounded-full bg-surface items-center justify-center">
          <Text className="text-base">✎</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {MOCK_POSTS.map((post) => (
          <TouchableOpacity
            key={post.id}
            activeOpacity={0.7}
            className="px-6 py-5 border-b border-border"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-x-2">
                <View className="w-7 h-7 rounded-full bg-surface items-center justify-center border border-border">
                  <Text className="text-xs font-medium text-secondary">
                    {post.author[0]}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-primary">
                  {post.author}
                </Text>
              </View>
              <Text className="text-xs text-secondary">{post.time}</Text>
            </View>
            <Text className="text-sm text-primary leading-relaxed">
              {post.content}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
