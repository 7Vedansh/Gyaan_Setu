import DatabaseService from './database.service';
import { QuizResult, QuizResultAnswer } from '@/types/store';

/**
 * @abstract Abstracted methods to add and get quiz results from the sqlite database
 */
class QuizService {
    private async ensureDb(): Promise<void> {
        await DatabaseService.init();
    }

    async saveQuizResult(
        quizId: number,
        score: number,
        totalQuestions: number,
        answers: QuizResultAnswer[]
    ): Promise<QuizResult> {
        await this.ensureDb();

        // Legacy summary quiz saves are folded into one attempt row for compatibility.
        const attemptedAt = Date.now();
        const id = await DatabaseService.insertQuizResult({
            quiz_id: String(quizId),
            topic_id: 'legacy-topic',
            chapter_id: 'legacy-chapter',
            selected_option: score,
            is_correct: score >= totalQuestions,
            time_taken_ms: undefined,
            attempted_at: attemptedAt,
        });

        return {
            id,
            quiz_id: String(quizId),
            topic_id: 'legacy-topic',
            chapter_id: 'legacy-chapter',
            selected_option: score,
            is_correct: score >= totalQuestions ? 1 : 0,
            time_taken_ms: null,
            attempted_at: attemptedAt,
            is_synced: 0,
        };
    }

    async getQuizResults(quizId?: number): Promise<QuizResult[]> {
        await this.ensureDb();

        if (quizId != null) {
            return DatabaseService.query<QuizResult>(
                'SELECT * FROM quiz_results WHERE quiz_id = ? ORDER BY attempted_at DESC',
                [String(quizId)]
            );
        }
        return DatabaseService.query<QuizResult>(
            'SELECT * FROM quiz_results ORDER BY attempted_at DESC'
        );
    }

    async getQuizResultById(id: number): Promise<QuizResult | null> {
        await this.ensureDb();
        const rows = await DatabaseService.query<QuizResult>(
            'SELECT * FROM quiz_results WHERE id = ?',
            [id]
        );
        return rows[0] ?? null;
    }

    async getUnsyncedQuizResults(): Promise<QuizResult[]> {
        await this.ensureDb();
        return DatabaseService.query<QuizResult>(
            'SELECT * FROM quiz_results WHERE is_synced = 0 ORDER BY attempted_at ASC'
        );
    }
}

export default new QuizService();
