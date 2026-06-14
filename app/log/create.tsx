import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../lib/api';
import { SearchResult } from '../../components/SearchCard';

type Visibility = 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';

const VISIBILITY_OPTIONS: { key: Visibility; label: string }[] = [
  { key: 'PUBLIC', label: '전체 공개' },
  { key: 'FOLLOWERS_ONLY', label: '팔로워' },
  { key: 'PRIVATE', label: '나만 보기' },
];

export default function CreateLogScreen() {
  const params = useLocalSearchParams<{ item?: string }>();
  const searchResult: SearchResult | null = params.item ? JSON.parse(params.item) : null;

  const [title, setTitle] = useState(searchResult?.title ?? '');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('입력 오류', '제목을 입력해주세요.');
      return;
    }
    if (!body.trim()) {
      Alert.alert('입력 오류', '본문을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const { data: logRes } = await api.post('/api/logs', {
        title: title.trim(),
        body: body.trim(),
        visibility,
      });
      const logId: number = logRes.data.id;

      if (searchResult?.imageUrl) {
        await api.post(`/api/logs/${logId}/contents`, {
          url: searchResult.imageUrl,
          contentType: 'IMAGE',
          sortOrder: 0,
        });
      }

      router.replace('/(tabs)/feed');
    } catch (err: any) {
      Alert.alert('저장 실패', err.response?.data?.message ?? '로그 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 상단 바 */}
        <View className="px-6 pt-2 pb-3 border-b border-border flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} activeOpacity={0.7}>
            <Text className="text-sm text-secondary">취소</Text>
          </TouchableOpacity>
          <Text className="text-base font-semibold text-primary">새 로그</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            hitSlop={8}
          >
            {saving ? (
              <ActivityIndicator color="#111111" size="small" />
            ) : (
              <Text className="text-sm font-semibold text-primary">저장</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* 콘텐츠 미리보기 */}
          {searchResult && (
            <View className="mx-6 mt-5 p-4 bg-surface border border-border rounded-xl flex-row items-center gap-x-3">
              {searchResult.imageUrl ? (
                <Image
                  source={{ uri: searchResult.imageUrl }}
                  className="w-10 h-14 rounded-md"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-10 h-14 rounded-md bg-border items-center justify-center">
                  <Text className="text-secondary text-xs">▭</Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-primary" numberOfLines={1}>
                  {searchResult.title}
                </Text>
                <Text className="text-xs text-secondary mt-0.5" numberOfLines={1}>
                  {searchResult.subtitle}
                </Text>
              </View>
            </View>
          )}

          {/* 제목 */}
          <View className="px-6 mt-6">
            <TextInput
              className="text-xl font-bold text-primary"
              placeholder="제목"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              editable={!saving}
            />
          </View>

          <View className="h-px bg-border mx-6 mt-4" />

          {/* 본문 */}
          <View className="px-6 mt-4">
            <TextInput
              className="text-sm text-primary leading-relaxed"
              placeholder="오늘의 기록을 남겨보세요..."
              placeholderTextColor="#9ca3af"
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
              style={{ minHeight: 200 }}
              editable={!saving}
            />
          </View>

          {/* 공개 범위 */}
          <View className="px-6 mt-8">
            <Text className="text-xs font-medium text-secondary uppercase tracking-widest mb-3">
              공개 범위
            </Text>
            <View className="flex-row gap-x-2">
              {VISIBILITY_OPTIONS.map((opt) => {
                const isActive = visibility === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setVisibility(opt.key)}
                    disabled={saving}
                    activeOpacity={0.7}
                    className={
                      isActive
                        ? 'flex-1 bg-primary rounded-xl py-2.5 items-center'
                        : 'flex-1 border border-border rounded-xl py-2.5 items-center'
                    }
                  >
                    <Text
                      className={
                        isActive
                          ? 'text-xs font-semibold text-white'
                          : 'text-xs font-medium text-secondary'
                      }
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
