import ApiService from '@/services/api.service';
import DatabaseService from '@/services/database.service';
import SyncService from '@/services/sync.service';

class ContentService {
    private hasRegisteredNetworkCallback = false;

    constructor() {
        this.ensureNetworkCallbackRegistered();
    }

    private ensureNetworkCallbackRegistered(): void {
        if (this.hasRegisteredNetworkCallback) return;
        SyncService.registerNetworkAvailableCallback(async () => {
            // Reserved hook for future chapter refresh logic.
        });
        this.hasRegisteredNetworkCallback = true;
    }

    /**
     * Call when user selects a subject for the first time.
     * Downloads the first chapter (chapter_order = 1) immediately.
     */
    async downloadFirstChapter(subjectId: string, firstChapterId: string): Promise<void> {
        await DatabaseService.init();

        const alreadyStored = await DatabaseService.hasChapter(firstChapterId);
        if (alreadyStored) return;

        const chapter = await ApiService.fetchChapterContent(firstChapterId);

        await DatabaseService.upsertChapter({
            chapter_id: chapter.chapter_id,
            chapter_name: chapter.chapter_name,
            chapter_order: chapter.chapter_order,
            subject_id: subjectId,
            subject_name: chapter.subject_name,
            total_topics: chapter.total_topics,
            topics: chapter.topics,
        });
    }

    /**
     * Ensure a specific chapter is present in local SQLite cache.
     * Used by Learn screen as a fallback if initial prefetch did not run.
     */
    async ensureChapterCached(subjectId: string, chapterId: string): Promise<void> {
        await DatabaseService.init();
        const exists = await DatabaseService.hasChapter(chapterId);
        if (exists) return;

        const chapter = await ApiService.fetchChapterContent(chapterId);
        await DatabaseService.upsertChapter({
            chapter_id: chapter.chapter_id,
            chapter_name: chapter.chapter_name,
            chapter_order: chapter.chapter_order,
            subject_id: subjectId,
            subject_name: chapter.subject_name,
            total_topics: chapter.total_topics,
            topics: chapter.topics,
        });
    }

    /**
     * Call whenever a topic is completed.
     * Handles prefetch at 70% and eviction at 50%.
     */
    async onTopicCompleted(params: {
        currentChapterId: string;
        completedTopics: number;
        totalTopics: number;
        nextChapterId?: string;
        prevChapterId?: string;
    }): Promise<void> {
        await DatabaseService.init();

        const progress = Math.round((params.completedTopics / params.totalTopics) * 100);
        const networkAvailable = SyncService.getBackgroundSyncStatus().networkAvailable;

        if (progress >= 70 && params.nextChapterId && networkAvailable) {
            await this.prefetchChapterIfNeeded(params.nextChapterId);
        }

        if (progress >= 50 && params.prevChapterId) {
            await DatabaseService.deleteChapter(params.prevChapterId);
        }
    }

    private async prefetchChapterIfNeeded(chapterId: string): Promise<void> {
        const exists = await DatabaseService.hasChapter(chapterId);
        if (exists) return;

        const chapter = await ApiService.fetchChapterContent(chapterId);
        await DatabaseService.upsertChapter({
            chapter_id: chapter.chapter_id,
            chapter_name: chapter.chapter_name,
            chapter_order: chapter.chapter_order,
            subject_id: chapter.subject_id,
            subject_name: chapter.subject_name,
            total_topics: chapter.total_topics,
            topics: chapter.topics,
        });
    }
}

export default new ContentService();
