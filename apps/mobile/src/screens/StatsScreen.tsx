import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useBillStore } from '../stores/billStore';

function CategoryBar({
  name,
  amount,
  total,
  color,
}: {
  name: string;
  amount: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (amount / total) * 100 : 0;

  return (
    <View style={styles.catRow}>
      <View style={styles.catInfo}>
        <Text style={styles.catName}>{name}</Text>
        <Text style={styles.catAmount}>¥{amount.toFixed(2)}</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.catPercent}>{percentage.toFixed(1)}%</Text>
    </View>
  );
}

const COLORS = ['#4F46E5', '#059669', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function StatsScreen() {
  const monthlyStats = useBillStore((s) => s.monthlyStats);
  const fetchStats = useBillStore((s) => s.fetchStats);

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = monthlyStats || { totalExpense: 0, totalIncome: 0, balance: 0, byCategory: [] };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>统计</Text>

      <View style={styles.overviewCard}>
        <View style={styles.overviewRow}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>总支出</Text>
            <Text style={[styles.overviewValue, { color: '#EF4444' }]}>
              ¥{stats.totalExpense.toFixed(2)}
            </Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>总收入</Text>
            <Text style={[styles.overviewValue, { color: '#059669' }]}>
              ¥{stats.totalIncome.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.overviewLabel}>结余</Text>
          <Text style={styles.balanceValue}>¥{stats.balance.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>支出分类占比</Text>
      {stats.byCategory.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>暂无支出数据</Text>
        </View>
      ) : (
        stats.byCategory
          .sort((a, b) => b.amount - a.amount)
          .map((cat, idx) => (
            <CategoryBar
              key={cat.categoryId}
              name={cat.categoryName}
              amount={cat.amount}
              total={stats.totalExpense}
              color={COLORS[idx % COLORS.length]}
            />
          ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 20 },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewLabel: { fontSize: 13, color: '#9CA3AF', marginBottom: 4 },
  overviewValue: { fontSize: 22, fontWeight: '700' },
  balanceRow: { alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  balanceValue: { fontSize: 26, fontWeight: '700', color: '#111827' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  catRow: { marginBottom: 16 },
  catInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: 14, color: '#374151' },
  catAmount: { fontSize: 14, fontWeight: '600', color: '#111827' },
  barBg: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  catPercent: { fontSize: 12, color: '#9CA3AF', marginTop: 2, textAlign: 'right' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});
