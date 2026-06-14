import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

const TRENDING_TAGS = ['일상', '독서', '운동', '요리', '여행', '개발', '음악', '사진'];

const MOCK_RESULTS = [
  { id: '1', author: '이서연', preview: '오늘의 독서 기록. 생각보다 빠르게 집중됐다...' },
  { id: '2', author: '박지훈', preview: '새벽 운동 루틴 3주차. 몸이 먼저 기억하기 시작했다...' },
  { id: '3', author: '최수아', preview: '제주 여행 둘째 날. 성산일출봉 일출을 봤다...' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="px-6 pt-2 pb-4">
        <Text className="text-xl font-bold text-primary tracking-tight mb-4">
          탐색
        </Text>
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3">
          <Text className="text-secondary mr-2">⊕</Text>
          <TextInput
            className="flex-1 text-sm text-primary"
            placeholder="기록, 사람, 태그 검색"
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {!query ? (
          /* 트렌딩 태그 */
          <View className="px-6">
            <Text className="text-xs font-medium text-secondary uppercase tracking-widest mb-4">
              인기 태그
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {TRENDING_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  className="border border-border rounded-full px-4 py-2"
                  activeOpacity={0.7}
                >
                  <Text className="text-sm text-primary">#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          /* 검색 결과 */
          <View>
            <Text className="text-xs font-medium text-secondary uppercase tracking-widest px-6 mb-3">
              검색 결과
            </Text>
            {MOCK_RESULTS.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="px-6 py-4 border-b border-border"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold text-primary mb-1">
                  {item.author}
                </Text>
                <Text className="text-sm text-secondary" numberOfLines={2}>
                  {item.preview}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
