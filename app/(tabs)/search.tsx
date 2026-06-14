import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import SearchCard, { SearchResult } from '../../components/SearchCard';

type TabKey = 'books' | 'movies' | 'tv';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'books', label: '책' },
  { key: 'movies', label: '영화' },
  { key: 'tv', label: '드라마' },
];

function normalizeBooks(raw: any[]): SearchResult[] {
  return raw.map((item, i) => ({
    id: item.isbn || String(i),
    imageUrl: item.thumbnail || null,
    title: item.title,
    subtitle: item.authors?.length ? item.authors.join(', ') : item.publisher ?? '',
  }));
}

function normalizeMovies(raw: any[]): SearchResult[] {
  return raw.map((item) => ({
    id: String(item.id),
    imageUrl: item.posterUrl || null,
    title: item.title,
    subtitle: item.releaseDate ? item.releaseDate.slice(0, 4) + '년' : '개봉연도 미상',
  }));
}

function normalizeTv(raw: any[]): SearchResult[] {
  return raw.map((item) => ({
    id: String(item.id),
    imageUrl: item.posterUrl || null,
    title: item.name,
    subtitle: item.firstAirDate ? item.firstAirDate.slice(0, 4) + '년' : '방영연도 미상',
  }));
}

const ENDPOINT: Record<TabKey, string> = {
  books: '/api/search/books',
  movies: '/api/search/movies',
  tv: '/api/search/tv',
};

const NORMALIZE: Record<TabKey, (raw: any[]) => SearchResult[]> = {
  books: normalizeBooks,
  movies: normalizeMovies,
  tv: normalizeTv,
};

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('books');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 탭/쿼리 변경 중 이전 요청 취소용
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (q: string, tab: TabKey) => {
    if (!q.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const { data: res } = await api.get(ENDPOINT[tab], {
        params: { query: q },
        signal: controller.signal,
      });
      setResults(NORMALIZE[tab](res.data ?? []));
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setError(err.response?.data?.message ?? '검색 중 오류가 발생했습니다.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 검색어 변경 → 0.5초 debounce
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      search(query, activeTab);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, activeTab, search]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setResults([]);
    setError(null);
  };

  const renderItem = useCallback(
    ({ item }: { item: SearchResult }) => (
      <SearchCard
        item={item}
        onPress={(i) =>
          router.push({ pathname: '/log/create', params: { item: JSON.stringify(i) } })
        }
      />
    ),
    []
  );

  const keyExtractor = useCallback((item: SearchResult) => item.id, []);

  const ListEmpty = () => {
    if (loading) return null;
    if (!query.trim()) {
      return (
        <View className="items-center pt-16">
          <Text className="text-sm text-secondary">검색어를 입력하세요</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View className="items-center pt-16 px-8">
          <Text className="text-sm text-secondary text-center">{error}</Text>
        </View>
      );
    }
    return (
      <View className="items-center pt-16">
        <Text className="text-sm text-secondary">검색 결과가 없습니다</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 검색창 */}
      <View className="px-6 pt-2 pb-3 border-b border-border">
        <Text className="text-xl font-bold text-primary tracking-tight mb-4">탐색</Text>
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3">
          <Text className="text-secondary mr-2 text-base">⌕</Text>
          <TextInput
            className="flex-1 text-sm text-primary"
            placeholder="제목, 저자, 감독 검색"
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Text className="text-secondary text-base ml-2">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 탭 */}
      <View className="flex-row border-b border-border">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabChange(tab.key)}
              activeOpacity={0.7}
              className="flex-1 items-center py-3"
            >
              <Text
                className={
                  isActive
                    ? 'text-sm font-semibold text-primary'
                    : 'text-sm text-secondary'
                }
              >
                {tab.label}
              </Text>
              {isActive && (
                <View className="absolute bottom-0 left-6 right-6 h-0.5 bg-primary rounded-full" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 로딩 인디케이터 */}
      {loading && (
        <View className="py-6 items-center">
          <ActivityIndicator color="#9ca3af" size="small" />
        </View>
      )}

      {/* 결과 목록 */}
      <FlatList
        data={results}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={!loading ? ListEmpty : null}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={results.length === 0 && !loading ? { flex: 1 } : undefined}
      />
    </SafeAreaView>
  );
}
