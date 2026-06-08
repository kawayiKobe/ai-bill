import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { syncData, getPendingCount, getLastSyncAt } from '../services/syncService';

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshSyncInfo = useCallback(async () => {
    const count = await getPendingCount();
    const last = await getLastSyncAt();
    setPendingCount(count);
    setLastSync(last);
  }, []);

  useEffect(() => {
    refreshSyncInfo();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncData();
      Alert.alert('同步完成', `推送 ${result.pushed} 条，拉取 ${result.pulled} 条`);
      await refreshSyncInfo();
    } catch (err: any) {
      Alert.alert('同步失败', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const formatLastSync = () => {
    if (!lastSync) return '从未同步';
    const date = new Date(lastSync);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>设置</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="person-circle-outline" size={24} color="#4F46E5" />
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>账户</Text>
            <Text style={styles.rowValue}>{user?.email || '未登录'}</Text>
          </View>
        </View>
      </View>

      {/* Sync section */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="cloud-outline" size={24} color="#4F46E5" />
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>数据同步</Text>
            <Text style={styles.rowValue}>
              {pendingCount > 0 ? `${pendingCount} 条待同步` : '已同步'} · 最后同步：{formatLastSync()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#4F46E5" />
          ) : (
            <Text style={styles.syncBtnText}>立即同步</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={toggleTheme}>
          <Ionicons name={theme === 'light' ? 'sunny-outline' : 'moon-outline'} size={24} color="#4F46E5" />
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>主题模式</Text>
            <Text style={styles.rowValue}>{theme === 'light' ? '浅色' : '深色'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  rowValue: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  syncBtn: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: 12,
    alignItems: 'center',
  },
  syncBtnText: { color: '#4F46E5', fontWeight: '600', fontSize: 14 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
});
