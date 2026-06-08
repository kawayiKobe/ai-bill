import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Category, BillType } from '../types';

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  restaurant: 'restaurant',
  car: 'car',
  cart: 'cart',
  'game-controller': 'game-controller',
  home: 'home',
  medkit: 'medkit',
  school: 'school',
  call: 'call',
  basket: 'basket',
  cash: 'cash',
  briefcase: 'briefcase',
  'trending-up': 'trending-up',
  gift: 'gift',
  'add-circle': 'add-circle',
  'ellipsis-horizontal-circle': 'ellipsis-horizontal-circle',
};

interface Props {
  categories: Category[];
  selectedId?: string;
  billType: BillType;
  onSelect: (category: Category) => void;
}

export default function CategoryPicker({ categories, selectedId, billType, onSelect }: Props) {
  const filtered = categories.filter((c) => c.type === billType);

  const renderItem = ({ item }: { item: Category }) => {
    const isSelected = item.id === selectedId;
    const iconName = ICON_MAP[item.icon] || 'help-circle';

    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.itemSelected]}
        onPress={() => onSelect(item)}
      >
        <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
          <Ionicons name={iconName} size={24} color={isSelected ? '#fff' : '#6B7280'} />
        </View>
        <Text style={[styles.label, isSelected && styles.labelSelected]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={filtered}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={4}
      scrollEnabled={false}
      columnWrapperStyle={styles.row}
    />
  );
}

const styles = StyleSheet.create({
  row: { justifyContent: 'flex-start', gap: 12, marginBottom: 12 },
  item: { alignItems: 'center', width: 72 },
  itemSelected: {},
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconWrapSelected: { backgroundColor: '#4F46E5' },
  label: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  labelSelected: { color: '#4F46E5', fontWeight: '600' },
});
