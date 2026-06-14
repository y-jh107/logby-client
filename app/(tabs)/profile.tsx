import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import LogCard, { LogItem } from '../../components/LogCard';

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface ProfileData {
  id: number;
  email: string;
  nickname: string;
  bio: string | null;
  profileImage: string | null;
}

interface ProfileStats {
  followerCount: number;
  followingCount: number;
  publicLogCount: number;
}

// ── 프로필 헤더 ───────────────────────────────────────────────────────────────

interface ProfileHeaderProps {
  profile: ProfileData;
  stats: ProfileStats;
  isEditing: boolean;
  editNickname: string;
  editBio: string;
  saving: boolean;
  onEditNicknameChange: (v: string) => void;
  onEditBioChange: (v: string) => void;
  onEditStart: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onLogout: () => void;
}

function ProfileHeader({
  profile,
  stats,
  isEditing,
  editNickname,
  editBio,
  saving,
  onEditNicknameChange,
  onEditBioChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onLogout,
}: ProfileHeaderProps) {
  return (
    <View>
      {/* 상단 바 */}
      <View className="px-6 pt-2 pb-3 border-b border-border flex-row items-center justify-between">
        <Text className="text-xl font-bold text-primary tracking-tight">프로필</Text>
        <TouchableOpacity onPress={onLogout} activeOpacity={0.7} hitSlop={8}>
          <Text className="text-sm text-secondary">로그아웃</Text>
        </TouchableOpacity>
      </View>

      {/* 프로필 정보 */}
      <View className="px-6 pt-7 pb-6 border-b border-border">
        {/* 아바타 */}
        <View className="flex-row items-center mb-5">
          <View className="w-16 h-16 rounded-full bg-surface border border-border items-center justify-center overflow-hidden mr-4">
            {profile.profileImage ? (
              <Image
                source={{ uri: profile.profileImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-2xl font-light text-secondary">
                {profile.nickname[0]}
              </Text>
            )}
          </View>

          {/* 통계 */}
          <View className="flex-1 flex-row justify-around">
            <StatItem label="로그" value={stats.publicLogCount} />
            <StatItem label="팔로워" value={stats.followerCount} />
            <StatItem label="팔로잉" value={stats.followingCount} />
          </View>
        </View>

        {/* 닉네임 / 소개 — 뷰 모드 */}
        {!isEditing ? (
          <View>
            <Text className="text-base font-bold text-primary mb-1">
              {profile.nickname}
            </Text>
            {profile.bio ? (
              <Text className="text-sm text-secondary leading-relaxed">
                {profile.bio}
              </Text>
            ) : (
              <Text className="text-sm text-secondary opacity-40">소개를 입력해주세요</Text>
            )}
            <TouchableOpacity
              className="mt-4 border border-border rounded-xl py-2.5 items-center"
              onPress={onEditStart}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-medium text-primary">프로필 편집</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* 편집 모드 */
          <View>
            <Text className="text-xs font-medium text-secondary uppercase tracking-widest mb-2">
              닉네임
            </Text>
            <TextInput
              className="border border-border rounded-xl px-4 py-3 text-sm text-primary bg-surface mb-3"
              value={editNickname}
              onChangeText={onEditNicknameChange}
              placeholder="닉네임"
              placeholderTextColor="#9ca3af"
              maxLength={20}
              editable={!saving}
            />
            <Text className="text-xs font-medium text-secondary uppercase tracking-widest mb-2">
              소개
            </Text>
            <TextInput
              className="border border-border rounded-xl px-4 py-3 text-sm text-primary bg-surface mb-4"
              value={editBio}
              onChangeText={onEditBioChange}
              placeholder="소개를 입력하세요 (최대 200자)"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              maxLength={200}
              editable={!saving}
              style={{ textAlignVertical: 'top', minHeight: 72 }}
            />
            <View className="flex-row gap-x-3">
              <TouchableOpacity
                className="flex-1 border border-border rounded-xl py-2.5 items-center"
                onPress={onEditCancel}
                disabled={saving}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-medium text-secondary">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-xl py-2.5 items-center"
                onPress={onEditSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-sm font-semibold text-white">저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 내 로그 섹션 레이블 */}
      <View className="px-6 pt-5 pb-3">
        <Text className="text-xs font-medium text-secondary uppercase tracking-widest">
          내 로그
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

export default function ProfileScreen() {
  const clearToken = useAuthStore((s) => s.clearToken);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 편집 모드
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchingLogsRef = useRef(false);

  // 프로필 + 통계 동시 로드
  const fetchProfile = useCallback(async () => {
    try {
      const { data: meRes } = await api.get('/api/users/me');
      const me: ProfileData = meRes.data;
      setProfile(me);

      const { data: statsRes } = await api.get(`/api/users/${me.id}`);
      const s: ProfileStats = {
        followerCount: statsRes.data.followerCount,
        followingCount: statsRes.data.followingCount,
        publicLogCount: statsRes.data.publicLogCount,
      };
      setStats(s);

      return me.id;
    } catch {
      Alert.alert('오류', '프로필을 불러올 수 없습니다.');
      return null;
    }
  }, []);

  // 로그 목록 로드
  const fetchLogs = useCallback(async (userId: number, pageNum: number, isRefresh = false) => {
    if (fetchingLogsRef.current) return;
    if (!isRefresh && !hasMore) return;

    fetchingLogsRef.current = true;
    if (!isRefresh) setLoadingLogs(true);

    try {
      const { data: res } = await api.get(`/api/users/${userId}/logs`, {
        params: { page: pageNum, size: 20 },
      });
      const springPage = res.data;
      const newLogs: LogItem[] = springPage.content;

      setLogs((prev) => (isRefresh ? newLogs : [...prev, ...newLogs]));
      setPage(pageNum);
      setHasMore(!springPage.last);
    } catch {
      // 로그 로드 실패는 조용히 처리
    } finally {
      fetchingLogsRef.current = false;
      setLoadingLogs(false);
    }
  }, [hasMore]);

  // 초기 로드
  useEffect(() => {
    (async () => {
      setLoadingProfile(true);
      const userId = await fetchProfile();
      setLoadingProfile(false);
      if (userId) await fetchLogs(userId, 0, true);
    })();
  }, []);

  // 당겨서 새로고침
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true);
    const userId = await fetchProfile();
    if (userId) await fetchLogs(userId, 0, true);
    setRefreshing(false);
  }, [fetchProfile, fetchLogs]);

  // 무한 스크롤
  const handleEndReached = useCallback(() => {
    if (!loadingLogs && hasMore && profile) {
      fetchLogs(profile.id, page + 1);
    }
  }, [loadingLogs, hasMore, profile, page, fetchLogs]);

  // 편집 시작
  const handleEditStart = useCallback(() => {
    if (!profile) return;
    setEditNickname(profile.nickname);
    setEditBio(profile.bio ?? '');
    setIsEditing(true);
  }, [profile]);

  // 편집 저장
  const handleEditSave = useCallback(async () => {
    if (!profile) return;
    if (editNickname.trim().length < 2) {
      Alert.alert('입력 오류', '닉네임은 2자 이상이어야 합니다.');
      return;
    }

    setSaving(true);
    try {
      const { data: res } = await api.patch('/api/users/me', {
        nickname: editNickname.trim(),
        bio: editBio.trim() || null,
      });
      setProfile((prev) => prev && { ...prev, ...res.data });
      setIsEditing(false);
    } catch (err: any) {
      Alert.alert('저장 실패', err.response?.data?.message ?? '프로필 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }, [profile, editNickname, editBio]);

  // 로그아웃
  const handleLogout = useCallback(() => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await clearToken();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, [clearToken]);

  const renderItem = useCallback(
    ({ item }: { item: LogItem }) => <LogCard item={item} />,
    []
  );

  const keyExtractor = useCallback((item: LogItem) => String(item.id), []);

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

  const ListEmpty = () => {
    if (loadingLogs) return null;
    return (
      <View className="py-12 items-center">
        <Text className="text-sm text-secondary">아직 작성한 로그가 없습니다</Text>
      </View>
    );
  };

  // 초기 로딩
  if (loadingProfile || !profile || !stats) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#9ca3af" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={logs}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          <ProfileHeader
            profile={profile}
            stats={stats}
            isEditing={isEditing}
            editNickname={editNickname}
            editBio={editBio}
            saving={saving}
            onEditNicknameChange={setEditNickname}
            onEditBioChange={setEditBio}
            onEditStart={handleEditStart}
            onEditSave={handleEditSave}
            onEditCancel={() => setIsEditing(false)}
            onLogout={handleLogout}
          />
        }
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}
