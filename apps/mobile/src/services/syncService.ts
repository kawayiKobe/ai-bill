import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';
import { getPendingBills, markBillsSynced, upsertBillFromServer, getPendingCount } from './localDb';

const LAST_SYNC_KEY = 'ai_bill_last_sync_at';

export async function getLastSyncAt(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_SYNC_KEY);
}

async function setLastSyncAt(timestamp: string) {
  await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp);
}

export async function syncData(): Promise<{ pushed: number; pulled: number }> {
  let pushed = 0;
  let pulled = 0;

  // Push local pending changes to server
  const pendingBills = await getPendingBills();
  if (pendingBills.length > 0) {
    const result = await apiClient.post<{ results: Array<{ id: string; status: string }> }>(
      '/sync/push',
      { bills: pendingBills },
    );
    const syncedIds = result.results
      .filter((r) => r.status === 'created' || r.status === 'updated')
      .map((r) => r.id);
    await markBillsSynced(syncedIds);
    pushed = syncedIds.length;
  }

  // Pull server changes since last sync
  const lastSyncAt = await getLastSyncAt();
  const pullResult = await apiClient.post<{
    bills: Array<{
      id: string;
      amount: number;
      type: string;
      categoryId: string;
      categoryName?: string;
      note?: string;
      date: string;
      createdAt: string;
      updatedAt: string;
      deletedAt?: string | null;
    }>;
    syncedAt: string;
  }>('/sync/pull', { lastSyncAt });

  for (const bill of pullResult.bills) {
    await upsertBillFromServer(bill);
  }
  pulled = pullResult.bills.length;

  await setLastSyncAt(pullResult.syncedAt);

  return { pushed, pulled };
}

export { getPendingCount };
