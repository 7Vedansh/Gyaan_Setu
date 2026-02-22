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
    quiz_id: string;
    topic_id: string;
    chapter_id: string;
    selected_option: number;
    is_correct: number;
    time_taken_ms?: number | null;
    attempted_at: number;
    is_synced: number;
}

export interface TopicProgressRow {
    id: number;
    chapter_id: string;
    stage_id: string;
    source_topic_id: string;
    stage_order: number;
    stage_type: "microlesson" | "quiz";
    is_completed: number;
    completed_at?: number | null;
    updated_at: number;
}

export interface QuizQuestionProgressRow {
    id: number;
    chapter_id: string;
    source_topic_id: string;
    stage_id: string;
    quiz_id: string;
    last_selected_option: number;
    is_correct: number;
    attempts_count: number;
    last_attempted_at: number;
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

export interface ChapterRow {
    id: number;
    chapter_id: string;
    chapter_name: string;
    chapter_order: number;
    subject_id: string;
    subject_name: string;
    total_topics: number;
    content_json: string;
    fetched_at: number;
}

export interface CachedChapter extends Omit<ChapterRow, 'content_json'> {
    topics: StoredTopic[];
}

export interface ChapterInput {
    chapter_id: string;
    chapter_name: string;
    chapter_order: number;
    subject_id: string;
    subject_name: string;
    total_topics?: number;
    topics: StoredTopic[];
}

export type CachedChapterRow = ChapterRow;
export type CachedChapterInput = ChapterInput;
export type QuizResultRow = QuizResult;
export type TopicCompletionRow = TopicProgressRow;
export type QuizQuestionAttemptRow = QuizQuestionProgressRow;
