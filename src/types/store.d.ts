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

export interface StoredQuiz {
    quiz_id: string;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
    order: number;
}

export interface StoredMicroLesson {
    microlesson_id: string;
    title: string;
    content: string[];
    order: number;
}

export interface StoredTopic {
    topic_id: string;
    topic_order: number;
    microlessons: StoredMicroLesson[];
    quizzes: StoredQuiz[];
}

export interface CachedChapterRow {
    id: number;
    chapter_id: string;
    chapter_name: string;
    chapter_order: number;
    subject_id: string;
    subject_name: string;
    total_topics: number;
    content_json: string;   // JSON.stringify(StoredTopic[])
    fetched_at: number;
}

export interface CachedChapter extends Omit<CachedChapterRow, 'content_json'> {
    topics: StoredTopic[];
}

export interface CachedChapterInput {
    chapter_id: string;
    chapter_name: string;
    chapter_order: number;
    subject_id: string;
    subject_name: string;
    topics: StoredTopic[];
}