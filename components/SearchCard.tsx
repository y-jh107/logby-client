import { View, Text, Image, TouchableOpacity } from 'react-native';

export interface SearchResult {
  id: string;
  imageUrl?: string | null;
  title: string;
  subtitle: string;
}

interface Props {
  item: SearchResult;
  onPress?: (item: SearchResult) => void;
}

export default function SearchCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(item)}
      className="flex-row items-center px-6 py-4 border-b border-border bg-white"
    >
      {/* 썸네일 */}
      <View className="w-11 h-16 rounded-md bg-surface border border-border overflow-hidden mr-4">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-base text-secondary opacity-40">▭</Text>
          </View>
        )}
      </View>

      {/* 텍스트 */}
      <View className="flex-1">
        <Text
          className="text-sm font-semibold text-primary leading-snug mb-1"
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text className="text-xs text-secondary" numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
