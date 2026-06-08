import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../services/apiClient';
import { useBillStore } from '../stores/billStore';

interface ParsedResult {
  amount: number | null;
  type: 'income' | 'expense' | null;
  category: string | null;
  note: string | null;
  date: string | null;
  confidence: number;
}

export default function AiInputScreen() {
  const navigation = useNavigation();
  const addBill = useBillStore((s) => s.addBill);
  const categories = useBillStore((s) => s.categories);

  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParsedResult | null>(null);

  const handleParse = async () => {
    if (!text.trim()) {
      Alert.alert('提示', '请输入记账描述');
      return;
    }
    setIsLoading(true);
    try {
      const parsed = await apiClient.post<ParsedResult>('/ai/parse-bill', { text: text.trim() });
      setResult(parsed);
    } catch (err: any) {
      Alert.alert('AI 解析失败', err.message || '请使用手动记账');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!result || !result.amount || !result.type) {
      Alert.alert('提示', '解析信息不完整，请手动补充');
      return;
    }

    const cat = categories.find(
      (c) => c.name === result.category && c.type === result.type,
    );

    try {
      await addBill({
        amount: result.amount,
        type: result.type,
        categoryId: cat?.id || categories[0]?.id || '',
        note: result.note || '',
        date: result.date || new Date().toISOString().split('T')[0],
      });
      Alert.alert('保存成功', '账单已记录');
      setText('');
      setResult(null);
    } catch (err: any) {
      Alert.alert('保存失败', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AI 记账</Text>
        <Text style={styles.subtitle}>说一句话就能记账</Text>
      </View>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder='例如："午饭花了35元"、"收到工资8000"'
          placeholderTextColor="#9CA3AF"
          multiline
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity
          style={[styles.sendBtn, isLoading && styles.sendBtnDisabled]}
          onPress={handleParse}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>AI 解析结果</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>金额</Text>
            <Text style={styles.resultValue}>
              {result.amount != null ? `¥${result.amount}` : '未识别'}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>类型</Text>
            <Text style={styles.resultValue}>
              {result.type === 'expense' ? '支出' : result.type === 'income' ? '收入' : '未识别'}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>分类</Text>
            <Text style={styles.resultValue}>{result.category || '未识别'}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>备注</Text>
            <Text style={styles.resultValue}>{result.note || '无'}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>日期</Text>
            <Text style={styles.resultValue}>{result.date || '今天'}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>置信度</Text>
            <Text style={styles.resultValue}>{(result.confidence * 100).toFixed(0)}%</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setResult(null)}>
              <Text style={styles.cancelBtnText}>重新输入</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>确认保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20, paddingTop: 56 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  inputArea: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    maxHeight: 100,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  sendBtnDisabled: { opacity: 0.6 },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  resultTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultLabel: { fontSize: 14, color: '#6B7280' },
  resultValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  confirmBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
