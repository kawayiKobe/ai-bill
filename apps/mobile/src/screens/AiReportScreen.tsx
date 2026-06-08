import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/apiClient';
import type { MonthlyStats } from '../types';

export default function AiReportScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<string | null>(null);
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.post<{ report: string; stats: MonthlyStats }>(
        '/ai/monthly-report',
        { year, month },
      );
      setReport(data.report);
      setStats(data.stats);
    } catch (err: any) {
      Alert.alert('生成失败', err.message || 'AI 服务暂时不可用');
    } finally {
      setIsLoading(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
    setReport(null);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
    setReport(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI 消费分析</Text>

      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={prevMonth}>
          <Ionicons name="chevron-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.monthText}>{year}年{month}月</Text>
        <TouchableOpacity onPress={nextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.generateBtn, isLoading && styles.generateBtnDisabled]}
        onPress={handleGenerate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.generateBtnText}>生成 AI 分析报告</Text>
          </>
        )}
      </TouchableOpacity>

      {report && (
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Ionicons name="sparkles" size={18} color="#4F46E5" />
            <Text style={styles.reportTitle}>AI 分析报告</Text>
          </View>
          <Text style={styles.reportText}>{report}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 20 },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 24,
  },
  monthText: { fontSize: 18, fontWeight: '600', color: '#111827' },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  reportTitle: { fontSize: 16, fontWeight: '700', color: '#4F46E5' },
  reportText: { fontSize: 15, lineHeight: 24, color: '#374151' },
});
