import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBillStore } from '../stores/billStore';
import CategoryPicker from '../components/CategoryPicker';
import type { BillType, Category } from '../types';

export default function BillFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const editBill = route.params?.bill;

  const addBill = useBillStore((s) => s.addBill);
  const updateBill = useBillStore((s) => s.updateBill);
  const categories = useBillStore((s) => s.categories);
  const fetchCategories = useBillStore((s) => s.fetchCategories);

  const [amount, setAmount] = useState(editBill ? String(editBill.amount) : '');
  const [billType, setBillType] = useState<BillType>(editBill?.type || 'expense');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [note, setNote] = useState(editBill?.note || '');
  const [date, setDate] = useState(editBill?.date || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editBill && categories.length > 0) {
      const cat = categories.find((c) => c.id === editBill.categoryId);
      if (cat) setSelectedCategory(cat);
    }
  }, [categories]);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('提示', '请输入有效的金额');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('提示', '请选择分类');
      return;
    }

    try {
      if (editBill) {
        await updateBill(editBill.id, {
          amount: parsedAmount,
          type: billType,
          categoryId: selectedCategory.id,
          note,
          date,
        });
      } else {
        await addBill({
          amount: parsedAmount,
          type: billType,
          categoryId: selectedCategory.id,
          note,
          date,
        });
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('保存失败', err.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{editBill ? '编辑账单' : '记一笔'}</Text>

      {/* Type toggle */}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, billType === 'expense' && styles.typeBtnActive]}
          onPress={() => setBillType('expense')}
        >
          <Text style={[styles.typeBtnText, billType === 'expense' && styles.typeBtnTextActive]}>
            支出
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, billType === 'income' && styles.typeBtnActiveIncome]}
          onPress={() => setBillType('income')}
        >
          <Text style={[styles.typeBtnText, billType === 'income' && styles.typeBtnTextActive]}>
            收入
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <View style={styles.amountRow}>
        <Text style={styles.currency}>¥</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          placeholderTextColor="#D1D5DB"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {/* Category */}
      <Text style={styles.sectionLabel}>分类</Text>
      <CategoryPicker
        categories={categories}
        selectedId={selectedCategory?.id}
        billType={billType}
        onSelect={setSelectedCategory}
      />

      {/* Note */}
      <Text style={styles.sectionLabel}>备注</Text>
      <TextInput
        style={styles.input}
        placeholder="添加备注..."
        placeholderTextColor="#9CA3AF"
        value={note}
        onChangeText={setNote}
      />

      {/* Date */}
      <Text style={styles.sectionLabel}>日期</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#9CA3AF"
        value={date}
        onChangeText={setDate}
      />

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>保存</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 20, marginTop: 40 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: '#4F46E5' },
  typeBtnActiveIncome: { backgroundColor: '#059669' },
  typeBtnText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  typeBtnTextActive: { color: '#fff' },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  currency: { fontSize: 32, fontWeight: '700', color: '#111827', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 32, fontWeight: '700', color: '#111827' },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },
  saveBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
