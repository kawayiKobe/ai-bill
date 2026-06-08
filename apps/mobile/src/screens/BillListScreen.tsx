import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBillStore } from '../stores/billStore';
import type { Bill } from '../types';

function BillItem({ bill, onDelete }: { bill: Bill; onDelete: (id: string) => void }) {
  const categoryName = (bill as any).category?.name || '未分类';
  const isExpense = bill.type === 'expense';

  return (
    <View style={styles.billItem}>
      <View style={styles.billLeft}>
        <Text style={styles.billCategory}>{categoryName}</Text>
        {bill.note ? <Text style={styles.billNote}>{bill.note}</Text> : null}
      </View>
      <View style={styles.billRight}>
        <Text style={[styles.billAmount, isExpense ? styles.expense : styles.income]}>
          {isExpense ? '-' : '+'}¥{Number(bill.amount).toFixed(2)}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('删除确认', '确定要删除这条账单吗？', [
              { text: '取消', style: 'cancel' },
              { text: '删除', style: 'destructive', onPress: () => onDelete(bill.id) },
            ]);
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function BillListScreen() {
  const navigation = useNavigation<any>();
  const bills = useBillStore((s) => s.bills);
  const isLoading = useBillStore((s) => s.isLoading);
  const monthlyStats = useBillStore((s) => s.monthlyStats);
  const fetchBills = useBillStore((s) => s.fetchBills);
  const fetchStats = useBillStore((s) => s.fetchStats);
  const deleteBill = useBillStore((s) => s.deleteBill);

  useEffect(() => {
    fetchBills();
    fetchStats();
  }, []);

  const onRefresh = useCallback(() => {
    fetchBills();
    fetchStats();
  }, []);

  const renderHeader = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>本月概览</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>支出</Text>
          <Text style={[styles.statValue, styles.expense]}>
            ¥{(monthlyStats?.totalExpense ?? 0).toFixed(2)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>收入</Text>
          <Text style={[styles.statValue, styles.income]}>
            ¥{(monthlyStats?.totalIncome ?? 0).toFixed(2)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>结余</Text>
          <Text style={styles.statValue}>
            ¥{(monthlyStats?.balance ?? 0).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>账单</Text>
        <TouchableOpacity onPress={() => navigation.navigate('BillForm')}>
          <Ionicons name="add-circle" size={32} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => <BillItem bill={item} onDelete={deleteBill} />}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#4F46E5" />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>还没有账单记录</Text>
            <Text style={styles.emptyHint}>点击右上角 + 开始记账</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#111827' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  expense: { color: '#EF4444' },
  income: { color: '#059669' },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  billLeft: { flex: 1 },
  billCategory: { fontSize: 15, fontWeight: '600', color: '#111827' },
  billNote: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  billRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  billAmount: { fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12 },
  emptyHint: { fontSize: 13, color: '#D1D5DB', marginTop: 4 },
});
