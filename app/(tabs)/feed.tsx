import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import LogCard, { LogItem } from '../../components/LogCard';

const PAGE_SIZE = 20;

export default function FeedScreen() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 중복 호출 방지
  const fetchingRef = useRef(false);

  const fetchFeed = useCallback(async (pageNum: number, isRefresh = false) => {
    if (fetchingRef.current) return;
    if (!isRefresh && !hasMore) return;

    fetchingRef.current = true;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const { data: res } = await api.get('/api/feeds', {
        params: { page: pageNum, size: PAGE_SIZE },
      });
      const springPage = res.data;
      const newItems: LogItem[] = springPage.content;

      setLogs((prev) => (isRefresh ? newItems : [...prev, ...newItems]));
      setPage(pageNum);
      setHasMore(!springPage.last);
    } catch (err: any) {
      setError(err.response?.data?.message ?? '피드를 불러올 수 없습니다.');
    } finally {
      fetchingRef.current = false;
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, [hasMore]);

  useEffect(() => {
    fetchFeed(0, true);
  }, []);

  const handleRefresh = useCallback(() => {
    setHasMore(true);
    fetchFeed(0, true);
  }, []);

  const handleEndReached = useCallback(() => {
    if (!loading && hasMore) {
      fetchFeed(page + 1);
    }
  }, [loading, hasMore, page, fetchFeed]);

  const renderItem = useCallback(
    ({ item }: { item: LogItem }) => (
      <LogCard item={item} onPress={(i) => router.push(`/log/${i.id}`)} />
    ),
    []
  );

  const keyExtractor = useCallback((item: LogItem) => String(item.id), []);

  const ListFooter = () => {
    if (loading && logs.length > 0) {
      return (
        <View className="py-8 items-center">
          <ActivityIndicator color="#9ca3af" size="small" />
        </View>
      );
    }
    if (!hasMore && logs.length > 0) {
      return (
        <View className="py-8 items-center">
          <Text className="text-xs text-secondary">모든 로그를 읽었습니다</Text>
        </View>
      );
    }
    return null;
  };

  const ListEmpty = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center pt-32">
          <ActivityIndicator color="#9ca3af" />
        </View>
      );
    }
    if (error) {
      return (
        <View className="flex-1 items-center justify-center pt-32 px-8">
          <Text className="text-sm text-secondary text-center mb-4">{error}</Text>
          <TouchableOpacity onPress={handleRefresh} activeOpacity={0.7}>
            <Text className="text-sm font-semibold text-primary">다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View className="flex-1 items-center justify-center pt-32">
        <Text className="text-sm text-secondary">팔로우한 사람의 로그가 없습니다</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="px-6 pt-2 pb-3 border-b border-border flex-row items-center justify-between">
        <Text className="text-xl font-bold text-primary tracking-tight">logby</Text>
        <TouchableOpacity
          className="w-8 h-8 rounded-full bg-surface items-center justify-center"
          activeOpacity={0.7}
          onPress={() => router.push('/log/create')}
        >
          <Text className="text-base">✎</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={logs}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={logs.length === 0 ? { flex: 1 } : undefined}
      />
    </SafeAreaView>
  );
}
