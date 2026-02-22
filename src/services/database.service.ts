import { ChapterInput, ChapterRow, QuizQuestionAttemptRow, QuizResultRow, TopicCompletionRow } from '@/types/store';
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
            // console.log('Database initialized successfully');
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
                sql: `DROP TABLE IF EXISTS quiz_results`, args: []
            },
            {
                sql: `CREATE TABLE IF NOT EXISTS quiz_results (
                    id              INTEGER PRIMARY KEY AUTOINCREMENT,
                    quiz_id         TEXT    NOT NULL,
                    topic_id        TEXT    NOT NULL,
                    chapter_id      TEXT    NOT NULL,
                    selected_option INTEGER NOT NULL,
                    is_correct      INTEGER NOT NULL,
                    time_taken_ms   INTEGER,
                    attempted_at    INTEGER NOT NULL,
                    is_synced       INTEGER NOT NULL DEFAULT 0
                )`, args: []
            },
            {
                sql: `CREATE TABLE IF NOT EXISTS chapters (
                    id              INTEGER PRIMARY KEY AUTOINCREMENT,
                    chapter_id      TEXT    NOT NULL UNIQUE,
                    chapter_name    TEXT    NOT NULL,
                    chapter_order   INTEGER NOT NULL,
                    subject_id      TEXT    NOT NULL,
                    subject_name    TEXT    NOT NULL,
                    total_topics    INTEGER NOT NULL DEFAULT 0,
                    content_json    TEXT    NOT NULL,
                    fetched_at      INTEGER NOT NULL
                )`,args: []
            },
            {
                sql: `CREATE TABLE IF NOT EXISTS topic_progress (
                    id              INTEGER PRIMARY KEY AUTOINCREMENT,
                    chapter_id      TEXT    NOT NULL,
                    stage_id        TEXT    NOT NULL UNIQUE,
                    source_topic_id TEXT    NOT NULL,
                    stage_order     INTEGER NOT NULL,
                    stage_type      TEXT    NOT NULL,
                    is_completed    INTEGER NOT NULL DEFAULT 0,
                    completed_at    INTEGER,
                    updated_at      INTEGER NOT NULL
                )`, args: []
            },
            {
                sql: `CREATE TABLE IF NOT EXISTS quiz_question_progress (
                    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
                    chapter_id           TEXT    NOT NULL,
                    source_topic_id      TEXT    NOT NULL,
                    stage_id             TEXT    NOT NULL,
                    quiz_id              TEXT    NOT NULL UNIQUE,
                    last_selected_option INTEGER NOT NULL,
                    is_correct           INTEGER NOT NULL,
                    attempts_count       INTEGER NOT NULL DEFAULT 1,
                    last_attempted_at    INTEGER NOT NULL
                )`, args: []
            }
        ];

        const results = await this.db.execAsync(queries, false);
        const err = results.find((r): r is ResultSetError => r != null && 'error' in r);
        if (err) throw err.error;

        // Create indexes after tables exist
        const indexQueries = [
            { sql: `CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at)`, args: [] },
            { sql: `CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id)`, args: [] },
            { sql: `CREATE INDEX IF NOT EXISTS idx_quiz_results_chapter_id ON quiz_results(chapter_id)`, args: [] },
            { sql: `CREATE INDEX IF NOT EXISTS idx_quiz_results_is_synced ON quiz_results(is_synced)`, args: [] },
            {sql: `CREATE INDEX IF NOT EXISTS idx_chapters_chapter_id ON chapters(chapter_id)`, args: [] },
            {sql: `CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON chapters(subject_id)`, args: [] },
            { sql: `CREATE INDEX IF NOT EXISTS idx_topic_progress_chapter_id ON topic_progress(chapter_id)`, args: [] },
            { sql: `CREATE INDEX IF NOT EXISTS idx_topic_progress_stage_order ON topic_progress(stage_order)`, args: [] },
            { sql: `CREATE INDEX IF NOT EXISTS idx_qqp_chapter_id ON quiz_question_progress(chapter_id)`, args: [] },
            { sql: `CREATE INDEX IF NOT EXISTS idx_qqp_source_topic_id ON quiz_question_progress(source_topic_id)`, args: [] },
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
    
    /**
 * Upsert a chapter into the cache.
 * If a row with the same chapter_id already exists it is replaced cleanly.
 */
    async upsertChapter(input: ChapterInput): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const sql = `
        INSERT INTO chapters
            (chapter_id, chapter_name, chapter_order, subject_id, subject_name, total_topics, content_json, fetched_at)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(chapter_id) DO UPDATE SET
            chapter_name  = excluded.chapter_name,
            chapter_order = excluded.chapter_order,
            subject_id    = excluded.subject_id,
            subject_name  = excluded.subject_name,
            total_topics  = excluded.total_topics,
            content_json  = excluded.content_json,
            fetched_at    = excluded.fetched_at
    `;

        const args = [
            input.chapter_id,
            input.chapter_name,
            input.chapter_order,
            input.subject_id,
            input.subject_name,
            input.total_topics ?? input.topics.length,
            JSON.stringify(input.topics),
            Date.now(),
        ];

        const results = await this.db.execAsync([{ sql, args }], false);
        const err = results.find((r): r is ResultSetError => r != null && 'error' in r);
        if (err) throw err.error;
    }

    /**
     * Fetch a single cached chapter row by chapter_id.
     * Returns null if not cached.
     */
    async getChapter(chapterId: string): Promise<ChapterRow | null> {
        const rows = await this.query<ChapterRow>(
            'SELECT * FROM chapters WHERE chapter_id = ? LIMIT 1',
            [chapterId]
        );
        return rows[0] ?? null;
    }

    /**
     * Fetch all cached chapters for a subject, ordered correctly.
     */
    async getChaptersBySubject(subjectId: string): Promise<ChapterRow[]> {
        return this.query<ChapterRow>(
            'SELECT * FROM chapters WHERE subject_id = ? ORDER BY chapter_order ASC',
            [subjectId]
        );
    }

    async getAnyCachedSubjectId(): Promise<string | null> {
        const rows = await this.query<{ subject_id: string }>(
            'SELECT subject_id FROM chapters ORDER BY fetched_at DESC LIMIT 1'
        );
        return rows[0]?.subject_id ?? null;
    }

    /**
     * Check if a chapter is cached without loading content_json.
     */
    async hasChapter(chapterId: string): Promise<boolean> {
        const rows = await this.query<{ count: number }>(
            'SELECT COUNT(*) as count FROM chapters WHERE chapter_id = ?',
            [chapterId]
        );
        return (rows[0]?.count ?? 0) > 0;
    }

    /**
     * Delete a single chapter from the cache.
     */
    async deleteChapter(chapterId: string): Promise<void> {
        await this.runSql(
            'DELETE FROM chapters WHERE chapter_id = ?',
            [chapterId]
        );
    }

    /**
     * Delete all cached chapters for a subject.
     */
    async deleteCachedChaptersBySubject(subjectId: string): Promise<void> {
        await this.runSql(
            'DELETE FROM chapters WHERE subject_id = ?',
            [subjectId]
        );
    }

    async insertQuizResult(data: {
        quiz_id: string;
        topic_id: string;
        chapter_id: string;
        selected_option: number;
        is_correct: boolean;
        time_taken_ms?: number;
        attempted_at: number;
    }): Promise<number> {
        if (!this.db) throw new Error('Database not initialized');
        const sql = `
            INSERT INTO quiz_results
                (quiz_id, topic_id, chapter_id, selected_option, is_correct, time_taken_ms, attempted_at, is_synced)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, 0)
        `;
        const args = [
            data.quiz_id,
            data.topic_id,
            data.chapter_id,
            data.selected_option,
            data.is_correct ? 1 : 0,
            data.time_taken_ms ?? null,
            data.attempted_at,
        ];
        const results = await this.db.execAsync([{ sql, args }], false);
        this.assertResult(results[0]);
        return results[0].insertId ?? 0;
    }

    async getUnsyncedQuizResults(): Promise<QuizResultRow[]> {
        return this.query<QuizResultRow>(
            'SELECT * FROM quiz_results WHERE is_synced = 0'
        );
    }

    async markQuizResultSynced(id: number): Promise<void> {
        await this.runSql(
            'UPDATE quiz_results SET is_synced = 1 WHERE id = ?',
            [id]
        );
    }

    async getTopicProgressByChapter(chapterId: string): Promise<TopicCompletionRow[]> {
        return this.query<TopicCompletionRow>(
            'SELECT * FROM topic_progress WHERE chapter_id = ? ORDER BY stage_order ASC',
            [chapterId]
        );
    }

    async markTopicStageCompleted(data: {
        chapter_id: string;
        stage_id: string;
        source_topic_id: string;
        stage_order: number;
        stage_type: 'microlesson' | 'quiz';
    }): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const now = Date.now();
        const sql = `
            INSERT INTO topic_progress
                (chapter_id, stage_id, source_topic_id, stage_order, stage_type, is_completed, completed_at, updated_at)
            VALUES
                (?, ?, ?, ?, ?, 1, ?, ?)
            ON CONFLICT(stage_id) DO UPDATE SET
                chapter_id      = excluded.chapter_id,
                source_topic_id = excluded.source_topic_id,
                stage_order     = excluded.stage_order,
                stage_type      = excluded.stage_type,
                is_completed    = 1,
                completed_at    = excluded.completed_at,
                updated_at      = excluded.updated_at
        `;

        const args = [
            data.chapter_id,
            data.stage_id,
            data.source_topic_id,
            data.stage_order,
            data.stage_type,
            now,
            now,
        ];

        const results = await this.db.execAsync([{ sql, args }], false);
        const err = results.find((r): r is ResultSetError => r != null && 'error' in r);
        if (err) throw err.error;
    }

    async upsertQuizQuestionProgress(data: {
        chapter_id: string;
        source_topic_id: string;
        stage_id: string;
        quiz_id: string;
        selected_option: number;
        is_correct: boolean;
        attempted_at: number;
    }): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        const sql = `
            INSERT INTO quiz_question_progress
                (chapter_id, source_topic_id, stage_id, quiz_id, last_selected_option, is_correct, attempts_count, last_attempted_at)
            VALUES
                (?, ?, ?, ?, ?, ?, 1, ?)
            ON CONFLICT(quiz_id) DO UPDATE SET
                chapter_id           = excluded.chapter_id,
                source_topic_id      = excluded.source_topic_id,
                stage_id             = excluded.stage_id,
                last_selected_option = excluded.last_selected_option,
                is_correct           = excluded.is_correct,
                attempts_count       = quiz_question_progress.attempts_count + 1,
                last_attempted_at    = excluded.last_attempted_at
        `;

        const args = [
            data.chapter_id,
            data.source_topic_id,
            data.stage_id,
            data.quiz_id,
            data.selected_option,
            data.is_correct ? 1 : 0,
            data.attempted_at,
        ];

        const results = await this.db.execAsync([{ sql, args }], false);
        const err = results.find((r): r is ResultSetError => r != null && 'error' in r);
        if (err) throw err.error;
    }

    async getQuizQuestionProgressByChapter(chapterId: string): Promise<QuizQuestionAttemptRow[]> {
        return this.query<QuizQuestionAttemptRow>(
            'SELECT * FROM quiz_question_progress WHERE chapter_id = ? ORDER BY last_attempted_at DESC',
            [chapterId]
        );
    }

    // Backward-compatible wrappers
    async upsertCachedChapter(input: ChapterInput): Promise<void> {
        return this.upsertChapter(input);
    }

    async getCachedChapter(chapterId: string): Promise<ChapterRow | null> {
        return this.getChapter(chapterId);
    }

    async getCachedChaptersBySubject(subjectId: string): Promise<ChapterRow[]> {
        return this.getChaptersBySubject(subjectId);
    }

    async isChapterCached(chapterId: string): Promise<boolean> {
        return this.hasChapter(chapterId);
    }

    async deleteCachedChapter(chapterId: string): Promise<void> {
        return this.deleteChapter(chapterId);
    }

    getDatabase(): ExpoSQLiteDatabase | null {
        return this.db;
    }
}

export default new DatabaseService();
