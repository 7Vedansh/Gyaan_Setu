import DatabaseService from './database.service';
import SyncService from './sync.service';
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

        console.log('[QuizService] Saving quiz result:', { quizId, score, totalQuestions });

        const data = {
            quiz_id: quizId,
            score,
            total_questions: totalQuestions,
            answers_json: JSON.stringify(answers),
            created_at: Date.now(),
            is_synced: 0,
        };

        const id = await DatabaseService.insert('quiz_results', data);
        console.log('[QuizService] Quiz result inserted with ID:', id);

        // Add to sync queue to push to MongoDB
        console.log('[QuizService] Adding to sync queue...');
        await SyncService.addToQueue({
            local_id: id,
            table_name: 'quiz_results',
            operation: 'CREATE',
            data: JSON.stringify(data),
        });
        console.log('[QuizService] Quiz result added to sync queue');

        return {
            id,
            quiz_id: quizId,
            score,
            total_questions: totalQuestions,
            answers_json: data.answers_json,
            created_at: data.created_at,
        } as QuizResult;
    }

    async getQuizResults(quizId?: number): Promise<QuizResult[]> {
        await this.ensureDb();

        if (quizId != null) {
            return DatabaseService.query<QuizResult>(
                'SELECT * FROM quiz_results WHERE quiz_id = ? ORDER BY created_at DESC',
                [quizId]
            );
        }
        return DatabaseService.query<QuizResult>(
            'SELECT * FROM quiz_results ORDER BY created_at DESC'
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
            'SELECT * FROM quiz_results WHERE is_synced = 0 ORDER BY created_at ASC'
        );
    }
}

export default new QuizService();
