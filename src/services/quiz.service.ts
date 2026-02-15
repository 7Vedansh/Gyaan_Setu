import DatabaseService from './database.service';
import { QuizResult, QuizResultAnswer } from '@/types/store';

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

        const data = {
            quiz_id: quizId,
            score,
            total_questions: totalQuestions,
            answers_json: JSON.stringify(answers),
            created_at: Date.now(),
        };

        const id = await DatabaseService.insert('quiz_results', data);
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
}

export default new QuizService();
