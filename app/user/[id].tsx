import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import LogCard, { LogItem } from '../../components/LogCard';

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: number;
  nickname: string;
  bio: string | null;
  profileImage: string | null;
  followerCount: number;
  followingCount: number;
  publicLogCount: number;
  isFollowing: boolean;
}

// ── 프로필 헤더 ───────────────────────────────────────────────────────────────

interface UserProfileHeaderProps {
  profile: UserProfile;
  isFollowing: boolean;
  followLoading: boolean;
  onFollowToggle: () => void;
  onBack: () => void;
}

function UserProfileHeader({
  profile,
  isFollowing,
  followLoading,
  onFollowToggle,
  onBack,
}: UserProfileHeaderProps) {
  return (
    <View>
      {/* 상단 바 */}
      <SafeAreaView>
        <View className="px-6 pt-2 pb-3 border-b border-border flex-row items-center">
          <TouchableOpacity onPress={onBack} hitSlop={8} activeOpacity={0.7}>
            <Text className="text-sm text-secondary">← 뒤로</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 프로필 정보 */}
      <View className="px-6 pt-7 pb-6 border-b border-border">
        <View className="flex-row items-center mb-5">
          {/* 아바타 */}
          <View className="w-16 h-16 rounded-full bg-surface border border-border items-center justify-center overflow-hidden mr-4">
            {profile.profileImage ? (
              <Image
                source={{ uri: profile.profileImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-2xl font-light text-secondary">{profile.nickname[0]}</Text>
            )}
          </View>

          {/* 통계 */}
          <View className="flex-1 flex-row justify-around">
            <StatItem label="로그" value={profile.publicLogCount} />
            <StatItem label="팔로워" value={profile.followerCount} />
            <StatItem label="팔로잉" value={profile.followingCount} />
          </View>
        </View>

        {/* 닉네임·소개 */}
        <Text className="text-base font-bold text-primary mb-1">{profile.nickname}</Text>
        {profile.bio ? (
          <Text className="text-sm text-secondary leading-relaxed mb-4">{profile.bio}</Text>
        ) : (
          <View className="mb-4" />
        )}

        {/* 팔로우 버튼 */}
        <TouchableOpacity
          onPress={onFollowToggle}
          disabled={followLoading}
          activeOpacity={0.85}
          className={
            isFollowing
              ? 'border border-border rounded-xl py-2.5 items-center'
              : 'bg-primary rounded-xl py-2.5 items-center'
          }
        >
          {followLoading ? (
            <ActivityIndicator color={isFollowing ? '#111111' : '#ffffff'} size="small" />
          ) : (
            <Text
              className={
                isFollowing
                  ? 'text-sm font-medium text-primary'
                  : 'text-sm font-semibold text-white'
              }
            >
              {isFollowing ? '팔로잉' : '팔로우'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 로그 섹션 레이블 */}
      <View className="px-6 pt-5 pb-3">
        <Text className="text-xs font-medium text-secondary uppercase tracking-widest">
          공개 로그
        </Text>
      </View>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View className="items-center">
      <Text className="text-lg font-bold text-primary">{value}</Text>
      <Text className="text-xs text-secondary mt-0.5">{label}</Text>
    </View>
  );
}

// ── 메인 화면 ─────────────────────────────────────────────────────────────────

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const myUserId = useAuthStore((s) => s.userId);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchingLogsRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    try {
      const { data: res } = await api.get(`/api/users/${id}`);
      const p: UserProfile = res.data;
      setProfile(p);
      setIsFollowing(p.isFollowing);
    } catch (err: any) {
      Alert.alert('오류', err.response?.data?.message ?? '프로필을 불러올 수 없습니다.');
      router.back();
    }
  }, [id]);

  const fetchLogs = useCallback(
    async (pageNum: number, isRefresh = false) => {
      if (fetchingLogsRef.current) return;
      if (!isRefresh && !hasMore) return;

      fetchingLogsRef.current = true;
      if (!isRefresh) setLoadingLogs(true);

      try {
        const { data: res } = await api.get(`/api/users/${id}/logs`, {
          params: { page: pageNum, size: 20 },
        });
        const springPage = res.data;
        const newLogs: LogItem[] = springPage.content;

        setLogs((prev) => (isRefresh ? newLogs : [...prev, ...newLogs]));
        setPage(pageNum);
        setHasMore(!springPage.last);
      } catch {
        // 조용히 처리
      } finally {
        fetchingLogsRef.current = false;
        setLoadingLogs(false);
      }
    },
    [id, hasMore]
  );

  useEffect(() => {
    (async () => {
      setLoadingProfile(true);
      await fetchProfile();
      setLoadingProfile(false);
      await fetchLogs(0, true);
    })();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true);
    await Promise.all([fetchProfile(), fetchLogs(0, true)]);
    setRefreshing(false);
  }, [fetchProfile, fetchLogs]);

  const handleEndReached = useCallback(() => {
    if (!loadingLogs && hasMore) fetchLogs(page + 1);
  }, [loadingLogs, hasMore, page, fetchLogs]);

  const handleFollowToggle = useCallback(async () => {
    if (followLoading) return;
    setFollowLoading(true);

    const prev = isFollowing;
    setIsFollowing(!prev);
    setProfile((p) =>
      p
        ? { ...p, followerCount: p.followerCount + (prev ? -1 : 1) }
        : p
    );

    try {
      if (prev) {
        await api.delete(`/api/follows/${id}`);
      } else {
        await api.post(`/api/follows/${id}`);
      }
    } catch (err: any) {
      setIsFollowing(prev);
      setProfile((p) =>
        p
          ? { ...p, followerCount: p.followerCount + (prev ? 1 : -1) }
          : p
      );
      Alert.alert('오류', err.response?.data?.message ?? '요청에 실패했습니다.');
    } finally {
      setFollowLoading(false);
    }
  }, [id, isFollowing, followLoading]);

  const renderItem = useCallback(
    ({ item }: { item: LogItem }) => (
      <LogCard item={item} onPress={(i) => router.push(`/log/${i.id}`)} />
    ),
    []
  );

  const ListFooter = () => {
    if (loadingLogs) {
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

  if (loadingProfile || !profile) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#9ca3af" />
      </View>
    );
  }

  // 내 프로필이면 탭의 프로필로 리다이렉트
  if (myUserId !== null && profile.id === myUserId) {
    router.replace('/(tabs)/profile');
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={logs}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={
          <UserProfileHeader
            profile={profile}
            isFollowing={isFollowing}
            followLoading={followLoading}
            onFollowToggle={handleFollowToggle}
            onBack={() => router.back()}
          />
        }
        ListEmptyComponent={
          !loadingLogs ? (
            <View className="py-12 items-center">
              <Text className="text-sm text-secondary">공개된 로그가 없습니다</Text>
            </View>
          ) : null
        }
        ListFooterComponent={ListFooter}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
