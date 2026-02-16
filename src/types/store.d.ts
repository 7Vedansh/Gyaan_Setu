// Sync Queue Input
export interface SyncQueueInput {
    local_id?: number;
    table_name: string;
    operation: SyncOperation;
    data?: string;
}

export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';

// Sync Queue Item (stored in DB)
export interface SyncQueueItem {
    id: number;
    local_id?: number;
    table_name: string;
    operation: SyncOperation;
    data?: string | null;
    created_at: number;
    retry_count: number;
    last_error?: string | null;
}

// Quiz result (one row per attempt)
export interface QuizResult {
    id: number;
    quiz_id: number;
    score: number;
    total_questions: number;
    answers_json: string;
    created_at: number;
}

export interface QuizResultAnswer {
    questionIndex: number;
    selectedAnswer: string;
    correct: boolean;
}

// Database Result
export interface DatabaseResult {
    insertId?: number;
    rowsAffected: number;
    rows: {
        length: number;
        item: (index: number) => any;
    };
}