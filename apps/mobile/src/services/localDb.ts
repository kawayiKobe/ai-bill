import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('ai_bill.db');
    await initTables(db);
  }
  return db;
}

async function initTables(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      categoryId TEXT NOT NULL,
      categoryName TEXT,
      note TEXT,
      date TEXT NOT NULL,
      syncId TEXT,
      syncStatus TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      deletedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      type TEXT NOT NULL,
      isPreset INTEGER NOT NULL DEFAULT 1,
      userId TEXT
    );
  `);
}

function generateId(): string {
  return 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

export async function insertBill(bill: {
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  categoryName?: string;
  note?: string;
  date: string;
}) {
  const database = await getDb();
  const id = generateId();
  const now = new Date().toISOString();

  await database.runAsync(
    `INSERT INTO bills (id, amount, type, categoryId, categoryName, note, date, syncStatus, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [id, bill.amount, bill.type, bill.categoryId, bill.categoryName || null, bill.note || null, bill.date, now, now],
  );
  return id;
}

export async function updateBill(id: string, updates: {
  amount?: number;
  type?: string;
  categoryId?: string;
  note?: string;
  date?: string;
}) {
  const database = await getDb();
  const sets: string[] = [];
  const values: any[] = [];

  if (updates.amount !== undefined) { sets.push('amount = ?'); values.push(updates.amount); }
  if (updates.type) { sets.push('type = ?'); values.push(updates.type); }
  if (updates.categoryId) { sets.push('categoryId = ?'); values.push(updates.categoryId); }
  if (updates.note !== undefined) { sets.push('note = ?'); values.push(updates.note); }
  if (updates.date) { sets.push('date = ?'); values.push(updates.date); }

  sets.push("updatedAt = datetime('now')");
  sets.push("syncStatus = 'pending'");
  values.push(id);

  await database.runAsync(`UPDATE bills SET ${sets.join(', ')} WHERE id = ?`, values);
}

export async function deleteBill(id: string) {
  const database = await getDb();
  await database.runAsync(
    `UPDATE bills SET deletedAt = datetime('now'), syncStatus = 'pending' WHERE id = ?`,
    [id],
  );
}

export async function queryBills(filters?: {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: string;
}) {
  const database = await getDb();
  let sql = 'SELECT * FROM bills WHERE deletedAt IS NULL';
  const params: any[] = [];

  if (filters?.startDate) { sql += ' AND date >= ?'; params.push(filters.startDate); }
  if (filters?.endDate) { sql += ' AND date <= ?'; params.push(filters.endDate); }
  if (filters?.categoryId) { sql += ' AND categoryId = ?'; params.push(filters.categoryId); }
  if (filters?.type) { sql += ' AND type = ?'; params.push(filters.type); }

  sql += ' ORDER BY date DESC, createdAt DESC';
  return database.getAllAsync(sql, params);
}

export async function getPendingBills() {
  const database = await getDb();
  return database.getAllAsync(
    `SELECT * FROM bills WHERE syncStatus = 'pending'`,
  );
}

export async function markBillsSynced(ids: string[]) {
  if (ids.length === 0) return;
  const database = await getDb();
  const placeholders = ids.map(() => '?').join(',');
  await database.runAsync(
    `UPDATE bills SET syncStatus = 'synced' WHERE id IN (${placeholders})`,
    ids,
  );
}

export async function upsertBillFromServer(bill: {
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
}) {
  const database = await getDb();
  await database.runAsync(
    `INSERT OR REPLACE INTO bills (id, amount, type, categoryId, categoryName, note, date, syncStatus, createdAt, updatedAt, deletedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, ?)`,
    [bill.id, bill.amount, bill.type, bill.categoryId, bill.categoryName || null, bill.note || null, bill.date, bill.createdAt, bill.updatedAt, bill.deletedAt || null],
  );
}

export async function getPendingCount(): Promise<number> {
  const database = await getDb();
  const result = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM bills WHERE syncStatus = 'pending'`,
  );
  return result?.count ?? 0;
}

export async function upsertCategories(categories: Array<{
  id: string;
  name: string;
  icon: string;
  type: string;
  isPreset: boolean;
  userId?: string;
}>) {
  const database = await getDb();
  for (const cat of categories) {
    await database.runAsync(
      `INSERT OR REPLACE INTO categories (id, name, icon, type, isPreset, userId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cat.id, cat.name, cat.icon, cat.type, cat.isPreset ? 1 : 0, cat.userId || null],
    );
  }
}

export async function getLocalCategories() {
  const database = await getDb();
  return database.getAllAsync('SELECT * FROM categories ORDER BY isPreset DESC, name ASC');
}
