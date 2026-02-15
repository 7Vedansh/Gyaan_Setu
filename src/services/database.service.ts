import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { DatabaseResult } from '../types/store';

SQLite.enablePromise(true);

class DatabaseService {
    private db: SQLiteDatabase | null = null;

    async init(): Promise<void> {
        if (this.db) return;
        try {
            this.db = await SQLite.openDatabase({
                name: 'app.db',
                location: 'default',
            });

            await this.createTables();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    private async createTables(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const queries = [
            // Main data table
            `CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mongodb_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        data TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        is_synced INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0
      )`,

            // Sync queue table
            `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id INTEGER,
        mongodb_id TEXT,
        table_name TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT,
        created_at INTEGER,
        retry_count INTEGER DEFAULT 0,
        last_error TEXT
      )`,

            // Quiz results table
            `CREATE TABLE IF NOT EXISTS quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        answers_json TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )`,

            // Indexes for performance
            `CREATE INDEX IF NOT EXISTS idx_items_synced ON items(is_synced)`,
            `CREATE INDEX IF NOT EXISTS idx_items_deleted ON items(is_deleted)`,
            `CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at)`,
            `CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id)`,
        ];

        for (const query of queries) {
            await this.db.executeSql(query, []);
        }
    }

    async insert(tableName: string, data: Record<string, any>): Promise<number> {
        if (!this.db) throw new Error('Database not initialized');
        if (data == null || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('insert() requires a non-null object');
        }

        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
        const [result] = await this.db.executeSql(query, values);

        return result.insertId || 0;
    }

    async update(tableName: string, id: number, data: Record<string, any>): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const setClause = Object.keys(data)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(data), id];

        const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
        await this.db.executeSql(query, values);
    }

    async delete(tableName: string, id: number): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Soft delete
        const query = `UPDATE ${tableName} SET is_deleted = 1, updated_at = ? WHERE id = ?`;
        await this.db.executeSql(query, [Date.now(), id]);
    }

    async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        if (!this.db) throw new Error('Database not initialized');

        const [result] = await this.db.executeSql(sql, params);
        const rows: T[] = [];

        for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
        }

        return rows;
    }

    async getUnsyncedItems(): Promise<any[]> {
        return this.query(
            'SELECT * FROM items WHERE is_synced = 0 AND is_deleted = 0'
        );
    }

    async getSyncQueue(): Promise<any[]> {
        return this.query(
            'SELECT * FROM sync_queue ORDER BY created_at ASC'
        );
    }

    getDatabase(): SQLiteDatabase | null {
        return this.db;
    }
}

export default new DatabaseService();