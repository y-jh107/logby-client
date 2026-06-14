import { View, Text, TouchableOpacity } from 'react-native';

export interface LogItem {
  id: number;
  authorId: number;
  authorNickname: string;
  title: string;
  body: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(isoString).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  });
}

interface Props {
  item: LogItem;
  onPress?: (item: LogItem) => void;
}

export default function LogCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(item)}
      className="px-6 py-5 border-b border-border bg-white"
    >
      {/* 작성자 + 시간 */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-x-2">
          <View className="w-7 h-7 rounded-full bg-surface border border-border items-center justify-center">
            <Text className="text-xs font-semibold text-secondary">
              {item.authorNickname[0]}
            </Text>
          </View>
          <Text className="text-sm font-semibold text-primary">
            {item.authorNickname}
          </Text>
        </View>
        <Text className="text-xs text-secondary">{timeAgo(item.createdAt)}</Text>
      </View>

      {/* 제목 */}
      <Text className="text-base font-bold text-primary mb-1" numberOfLines={1}>
        {item.title}
      </Text>

      {/* 본문 미리보기 */}
      <Text className="text-sm text-secondary leading-relaxed mb-4" numberOfLines={2}>
        {item.body}
      </Text>

      {/* 좋아요 · 댓글 */}
      <View className="flex-row items-center gap-x-4">
        <View className="flex-row items-center gap-x-1.5">
          <Text className="text-xs text-secondary">♡</Text>
          <Text className="text-xs text-secondary">{item.likeCount}</Text>
        </View>
        <View className="flex-row items-center gap-x-1.5">
          <Text className="text-xs text-secondary">○</Text>
          <Text className="text-xs text-secondary">{item.commentCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
