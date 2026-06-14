import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface ContentItem {
  id: number;
  contentType: 'IMAGE' | 'VIDEO';
  url: string;
  sortOrder: number;
}

interface LogDetail {
  id: number;
  authorId: number;
  authorNickname: string;
  title: string;
  body: string;
  visibility: string;
  contents: ContentItem[];
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  createdAt: string;
}

interface CommentItem {
  id: number;
  userId: number;
  nickname: string;
  body: string;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

// ── 로그 상세 헤더 ────────────────────────────────────────────────────────────

interface LogHeaderProps {
  log: LogDetail;
  likedByMe: boolean;
  likeCount: number;
  onLikeToggle: () => void;
  onBack: () => void;
}

function LogHeader({ log, likedByMe, likeCount, onLikeToggle, onBack }: LogHeaderProps) {
  return (
    <View>
      {/* 상단 바 */}
      <SafeAreaView>
        <View className="px-6 pt-2 pb-3 border-b border-border flex-row items-center justify-between">
          <TouchableOpacity onPress={onBack} hitSlop={8} activeOpacity={0.7}>
            <Text className="text-sm text-secondary">← 뒤로</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLikeToggle} activeOpacity={0.7} hitSlop={8}>
            <Text className={`text-xl ${likedByMe ? 'text-primary' : 'text-secondary'}`}>
              {likedByMe ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 작성자 */}
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          className="flex-row items-center gap-x-2"
          activeOpacity={0.7}
          onPress={() => router.push(`/user/${log.authorId}`)}
        >
          <View className="w-8 h-8 rounded-full bg-surface border border-border items-center justify-center">
            <Text className="text-xs font-semibold text-secondary">{log.authorNickname[0]}</Text>
          </View>
          <Text className="text-sm font-semibold text-primary">{log.authorNickname}</Text>
        </TouchableOpacity>
        <Text className="text-xs text-secondary">{timeAgo(log.createdAt)}</Text>
      </View>

      {/* 제목 */}
      <Text className="text-xl font-bold text-primary px-6 mb-3">{log.title}</Text>

      {/* 콘텐츠 이미지 */}
      {log.contents.filter((c) => c.contentType === 'IMAGE').map((c) => (
        <Image
          key={c.id}
          source={{ uri: c.url }}
          className="w-full"
          style={{ height: 220 }}
          resizeMode="cover"
        />
      ))}

      {/* 본문 */}
      <Text className="text-sm text-primary leading-relaxed px-6 py-5">{log.body}</Text>

      {/* 좋아요·댓글 수 */}
      <View className="px-6 pb-5 flex-row items-center gap-x-5 border-b border-border">
        <View className="flex-row items-center gap-x-1.5">
          <Text className="text-sm text-secondary">♡</Text>
          <Text className="text-sm text-secondary">{likeCount}</Text>
        </View>
        <View className="flex-row items-center gap-x-1.5">
          <Text className="text-sm text-secondary">○</Text>
          <Text className="text-sm text-secondary">{log.commentCount}</Text>
        </View>
      </View>

      {/* 댓글 섹션 레이블 */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-xs font-medium text-secondary uppercase tracking-widest">댓글</Text>
      </View>
    </View>
  );
}

// ── 메인 화면 ─────────────────────────────────────────────────────────────────

export default function LogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const myUserId = useAuthStore((s) => s.userId);

  const [log, setLog] = useState<LogDetail | null>(null);
  const [likedByMe, setLikedByMe] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const likePending = useRef(false);

  const fetchLog = useCallback(async () => {
    try {
      const [logRes, commentsRes] = await Promise.all([
        api.get(`/api/logs/${id}`),
        api.get(`/api/logs/${id}/comments`),
      ]);
      const logData: LogDetail = logRes.data.data;
      setLog(logData);
      setLikedByMe(logData.likedByMe);
      setLikeCount(logData.likeCount);
      setComments(commentsRes.data.data ?? []);
    } catch (err: any) {
      Alert.alert('오류', err.response?.data?.message ?? '로그를 불러올 수 없습니다.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  const handleLikeToggle = useCallback(async () => {
    if (likePending.current) return;
    likePending.current = true;

    // 낙관적 업데이트
    const prev = likedByMe;
    setLikedByMe(!prev);
    setLikeCount((c) => (prev ? c - 1 : c + 1));

    try {
      if (prev) {
        await api.delete(`/api/logs/${id}/likes`);
      } else {
        await api.post(`/api/logs/${id}/likes`);
      }
    } catch {
      // 실패 시 롤백
      setLikedByMe(prev);
      setLikeCount((c) => (prev ? c + 1 : c - 1));
    } finally {
      likePending.current = false;
    }
  }, [id, likedByMe]);

  const handleSendComment = useCallback(async () => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      const { data: res } = await api.post(`/api/logs/${id}/comments`, {
        body: commentText.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
    } catch (err: any) {
      Alert.alert('오류', err.response?.data?.message ?? '댓글 작성에 실패했습니다.');
    } finally {
      setSendingComment(false);
    }
  }, [id, commentText]);

  const handleDeleteComment = useCallback(
    (commentId: number) => {
      Alert.alert('댓글 삭제', '이 댓글을 삭제하시겠어요?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/logs/${id}/comments/${commentId}`);
              setComments((prev) => prev.filter((c) => c.id !== commentId));
            } catch (err: any) {
              Alert.alert('오류', err.response?.data?.message ?? '삭제에 실패했습니다.');
            }
          },
        },
      ]);
    },
    [id]
  );

  const renderComment = useCallback(
    ({ item }: { item: CommentItem }) => (
      <View className="px-6 py-4 border-b border-border flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center gap-x-2 mb-1">
            <Text className="text-xs font-semibold text-primary">{item.nickname}</Text>
            <Text className="text-xs text-secondary">{timeAgo(item.createdAt)}</Text>
          </View>
          <Text className="text-sm text-primary leading-relaxed">{item.body}</Text>
        </View>
        {item.userId === myUserId && (
          <TouchableOpacity
            onPress={() => handleDeleteComment(item.id)}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Text className="text-xs text-secondary">삭제</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [myUserId, handleDeleteComment]
  );

  if (loading || !log) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#9ca3af" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderComment}
        ListHeaderComponent={
          <LogHeader
            log={log}
            likedByMe={likedByMe}
            likeCount={likeCount}
            onLikeToggle={handleLikeToggle}
            onBack={() => router.back()}
          />
        }
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="text-sm text-secondary">첫 댓글을 남겨보세요</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      {/* 댓글 입력 */}
      <View className="border-t border-border px-4 py-3 flex-row items-center gap-x-3 bg-white">
        <TextInput
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-primary"
          placeholder="댓글을 입력하세요"
          placeholderTextColor="#9ca3af"
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
          editable={!sendingComment}
        />
        <TouchableOpacity
          onPress={handleSendComment}
          disabled={sendingComment || !commentText.trim()}
          activeOpacity={0.7}
          className="w-9 h-9 bg-primary rounded-xl items-center justify-center"
          style={{ opacity: commentText.trim() ? 1 : 0.3 }}
        >
          {sendingComment ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white text-sm">↑</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
