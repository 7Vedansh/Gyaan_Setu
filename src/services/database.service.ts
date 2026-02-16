import * as SQLite from 'expo-sqlite';
import type { ResultSet, ResultSetError } from 'expo-sqlite';

type ExpoSQLiteDatabase = SQLite.SQLiteDatabase;

/**
 * @abstract Service for managing the sqlite database. Don't directly use this class instead use QuizService to interact with the sqlite database.
 */
class DatabaseService {
    private db: ExpoSQLiteDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    async init(): Promise<void> {
        if (this.db != null && typeof this.db.execAsync === 'function') {
            return;
        }
        if (this.initPromise != null) {
            await this.initPromise;
            return;
        }

        this.initPromise = this._doInit();
        try {
            await this.initPromise;
        } finally {
            this.initPromise = null;
        }
    }

    private async _doInit(): Promise<void> {
        try {
            const opened = SQLite.openDatabase('app.db');

            if (opened == null || typeof opened.execAsync !== 'function') {
                throw new Error('Database open did not return a valid database object');
            }

            this.db = opened;
            await this.createTables();
            console.log('Database initialized successfully');
        } catch (error) {
            this.db = null;
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    private async createTables(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const queries: { sql: string; args: unknown[] }[] = [
            {
                sql: `CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                local_id INTEGER,
                table_name TEXT NOT NULL,
                operation TEXT NOT NULL,
                data TEXT,
                created_at INTEGER,
                retry_count INTEGER DEFAULT 0,
                last_error TEXT
            )`, args: []
            },
            {
                sql: `CREATE TABLE IF NOT EXISTS quiz_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quiz_id INTEGER NOT NULL,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                answers_json TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                is_synced INTEGER DEFAULT 0
            )`, args: []
            },
        ];

        const results = await this.db.execAsync(queries, false);
        const err = results.find((r): r is ResultSetError => r != null && 'error' in r);
        if (err) throw err.error;

        // Create indexes after tables exist
        const indexQueries = [
            { sql: `CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at)`, args: [] },
            { sql: `CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id)`, args: [] },
        ];

        const indexResults = await this.db.execAsync(indexQueries, false);
        const indexErr = indexResults.find((r): r is ResultSetError => r != null && 'error' in r);
        if (indexErr) throw indexErr.error;
    }

    private assertResult(first: ResultSetError | ResultSet | undefined): asserts first is ResultSet {
        if (first == null) return;
        if ('error' in first) throw first.error;
    }

    async insert(tableName: string, data: Record<string, any>): Promise<number> {
        if (!this.db) throw new Error('Database not initialized');
        if (data == null || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('insert() requires a non-null object');
        }

        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const args = Object.values(data);

        const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
        const results = await this.db.execAsync([{ sql, args }], false);
        this.assertResult(results[0]);
        return results[0].insertId ?? 0;
    }

    async update(tableName: string, id: number, data: Record<string, any>): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const setClause = Object.keys(data)
            .map(key => `${key} = ?`)
            .join(', ');
        const args = [...Object.values(data), id];

        const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
        await this.db.execAsync([{ sql, args }], false);
    }

    async delete(tableName: string, id: number): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const sql = `DELETE FROM ${tableName} WHERE id = ?`;
        await this.db.execAsync([{ sql, args: [id] }], false);
    }

    async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        if (!this.db) throw new Error('Database not initialized');

        const results = await this.db.execAsync([{ sql, args: params }], true);
        this.assertResult(results[0]);
        const rows = results[0].rows;
        return (Array.isArray(rows) ? rows : []) as T[];
    }

    /** Run a write SQL (e.g. DELETE). Use query() for SELECT. */
    async runSql(sql: string, params: any[] = []): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        const results = await this.db.execAsync([{ sql, args: params }], false);
        const err = results.find((r): r is ResultSetError => r != null && 'error' in r);
        if (err) throw err.error;
    }

    async getSyncQueue(): Promise<any[]> {
        return this.query(
            'SELECT * FROM sync_queue ORDER BY created_at ASC'
        );
    }

    async getPendingSyncCount(): Promise<number> {
        const results = await this.query<{ count: number }>(
            'SELECT COUNT(*) as count FROM sync_queue'
        );
        return results[0]?.count || 0;
    }

    getDatabase(): ExpoSQLiteDatabase | null {
        return this.db;
    }
}

export default new DatabaseService();
