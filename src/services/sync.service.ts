import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from './database.service';
import ApiService from './api.service';
import { SyncQueueItem, SyncQueueInput } from '../types/store';

const SYNC_INTERVAL_KEY = 'last_sync_time';
const MIN_SYNC_INTERVAL = 30000; // 30 seconds minimum between syncs
const BACKGROUND_SYNC_CHECK_INTERVAL = 5000; // Check every 5 seconds if there's data to sync

/**
 * @abstract Methods to manage a queue which stores quiz results for syncing to MongoDB
 */
class SyncService {
    private isSyncing: boolean = false;
    private networkUnsubscribe: NetInfoSubscription | null = null;
    private backgroundSyncInterval: NodeJS.Timeout | null = null;
    private isNetworkAvailable: boolean = false;
    private lastQueueCheckTime: number = 0;
    private onNetworkAvailableCallbacks: Array<() => Promise<void>> = [];

    registerNetworkAvailableCallback(cb: () => Promise<void>): void {
        this.onNetworkAvailableCallbacks.push(cb);
    }

    async addToQueue(queueItem: SyncQueueInput): Promise<void> {
        const data = {
            local_id: queueItem.local_id || null,
            table_name: queueItem.table_name,
            operation: queueItem.operation,
            data: queueItem.data || null,
            created_at: Date.now(),
            retry_count: 0,
        };

        // console.log('[Queue] Adding item to sync queue:', { table: data.table_name, operation: data.operation, local_id: data.local_id });
        await DatabaseService.insert('sync_queue', data);
        // console.log('[Queue] Item added to sync queue successfully');
    }

    /**
     * @abstract Keeps a watch on change in the network state (stable <-> unstable)
     */
    async startMonitoring(): Promise<void> {
        // console.log('[Network Monitor] Starting network monitoring');
        this.networkUnsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
            // console.log('[Network Monitor] Network state changed:', {
            //     isConnected: state.isConnected,
            //     isInternetReachable: state.isInternetReachable,
            //     type: state.type,
            // });

            const shouldSync = this.shouldSync(state);
            // console.log('[Network Monitor] Should sync?', shouldSync);

            this.isNetworkAvailable = shouldSync;

            if (shouldSync) {
                // console.log('[Network Monitor] Network is good, starting background sync...');
                this.startBackgroundSync();
                for (const cb of this.onNetworkAvailableCallbacks) {
                    cb().catch(err => console.error('[Network] Callback error:', err));
                }
                // Try immediate sync on network restoration
                try {
                    await this.performSync();
                } catch (error) {
                    console.error('[Network Monitor] Immediate sync error (non-blocking):', error);
                }
            } else {
                // console.log('[Network Monitor] Network is poor, stopping background sync...');
                this.stopBackgroundSync();
            }
        });

        // Initial network check
        const state = await NetInfo.fetch();
        this.isNetworkAvailable = this.shouldSync(state);
        if (this.isNetworkAvailable) {
            this.startBackgroundSync();
        }
    }

    stopMonitoring(): void {
        // console.log('[Network Monitor] Stopping network monitoring');
        if (this.networkUnsubscribe) {
            this.networkUnsubscribe();
        }
        this.stopBackgroundSync();
    }

    /** 
     * @abstract Check if network is stable enough for syncing
     */
    private shouldSync(networkState: NetInfoState): boolean {
        // Check if connected
        if (!networkState.isConnected || !networkState.isInternetReachable) {
            return false;
        }

        // Check connection type and speed
        const { type, details } = networkState;

        // WiFi is always good
        if (type === 'wifi') {
            return true;
        }

        // For cellular, check if it's fast enough (4G/5G)
        if (type === 'cellular') {
            const cellularGeneration = details?.cellularGeneration;
            return cellularGeneration === '4g' || cellularGeneration === '5g';
        }

        return false;
    }

    /**
     * @abstract Returns a boolean which tells if sufficient time interval has passed to sync again
     */
    private async canSyncNow(): Promise<boolean> {
        const lastSync = await AsyncStorage.getItem(SYNC_INTERVAL_KEY);
        if (!lastSync) return true;

        const timeSinceLastSync = Date.now() - parseInt(lastSync, 10);
        return timeSinceLastSync >= MIN_SYNC_INTERVAL;
    }

    /**
     * @abstract Start background sync - checks for unsynced data periodically
     */
    private startBackgroundSync(): void {
        if (this.backgroundSyncInterval !== null) {
            // console.log('[Background Sync] Background sync already running');
            return;
        }

        // console.log('[Background Sync] Starting background sync checks every', BACKGROUND_SYNC_CHECK_INTERVAL, 'ms');

        this.backgroundSyncInterval = setInterval(async () => {
            try {
                await this.checkAndSyncQueue();
            } catch (error) {
                console.error('[Background Sync] Check failed:', error);
            }
        }, BACKGROUND_SYNC_CHECK_INTERVAL);
    }

    /**
     * @abstract Stop background sync
     */
    private stopBackgroundSync(): void {
        if (this.backgroundSyncInterval !== null) {
            // console.log('[Background Sync] Stopping background sync');
            clearInterval(this.backgroundSyncInterval);
            this.backgroundSyncInterval = null;
        }
    }

    /**
     * @abstract Check if background sync is currently active
     */
    isBackgroundSyncActive(): boolean {
        return this.backgroundSyncInterval !== null;
    }

    /**
     * @abstract Get background sync status
     */
    getBackgroundSyncStatus(): {
        isActive: boolean;
        isSyncing: boolean;
        networkAvailable: boolean;
    } {
        return {
            isActive: this.isBackgroundSyncActive(),
            isSyncing: this.isSyncing,
            networkAvailable: this.isNetworkAvailable,
        };
    }

    /**
     * @abstract Get pending sync items count
     */
    async getPendingSyncCount(): Promise<number> {
        try {
            await DatabaseService.init();
            return DatabaseService.getPendingSyncCount();
        } catch (error) {
            console.error('[Sync] Error getting pending sync count:', error);
            return 0;
        }
    }

    /**
     * @abstract Check if there's unsynced data and sync if conditions are met
     */
    private async checkAndSyncQueue(): Promise<void> {
        // Don't check too frequently
        const now = Date.now();
        if (now - this.lastQueueCheckTime < 1000) {
            return;
        }
        this.lastQueueCheckTime = now;

        // Skip if sync already in progress
        if (this.isSyncing) {
            return;
        }

        // Skip if network not available
        if (!this.isNetworkAvailable) {
            return;
        }

        try {
            await DatabaseService.init();
            const queueItems = await DatabaseService.getSyncQueue() as SyncQueueItem[];
            const unsyncedQuizResults = await DatabaseService.getUnsyncedQuizResults();

            if (queueItems.length > 0 || unsyncedQuizResults.length > 0) {
                // console.log(`[Background Sync] Found ${queueItems.length} unsynced items, starting sync...`);
                await this.performSync(true); // Force sync to bypass throttle
            }
        } catch (error) {
            console.error('[Background Sync] Error checking queue:', error);
        }
    }

    /**
     * Run sync: process the sync queue (push quiz results to server).
     * @param force If true, skip the 30s throttle (e.g. when user taps "Sync now").
     */
    async performSync(force?: boolean): Promise<void> {
        if (this.isSyncing) {
            // console.log('[Sync] Sync already in progress, skipping');
            throw new Error('Sync already in progress');
        }

        if (!force && !(await this.canSyncNow())) {
            // console.log('[Sync] Throttled: Too soon since last sync');
            throw new Error('Too soon since last sync. Try again in a moment.');
        }

        this.isSyncing = true;
        // console.log('[Sync] ===== START SYNC =====');

        try {
            await DatabaseService.init();
            // console.log('[Sync] Database initialized');

            await this.processSyncQueue();
            await this.syncQuizResults();

            await AsyncStorage.setItem(SYNC_INTERVAL_KEY, Date.now().toString());
            // console.log('[Sync] ===== SYNC COMPLETED SUCCESSFULLY =====');
        } catch (error) {
            console.error('[Sync] ===== SYNC FAILED =====', error);
            throw error;
        } finally {
            this.isSyncing = false;
        }
    }

    private async processSyncQueue(): Promise<void> {
        const queueItems = await DatabaseService.getSyncQueue() as SyncQueueItem[];

        // console.log(`[Sync] Processing ${queueItems.length} items in queue`);

        if (queueItems.length === 0) {
            // console.log('[Sync] Queue is empty, nothing to sync');
            return;
        }

        for (const item of queueItems) {
            // console.log(`[Sync] Processing queue item #${item.id}: ${item.operation} on ${item.table_name}`);
            try {
                await this.syncQueueItem(item);
                // console.log(`[Sync] Successfully synced item #${item.id}`);

                // Remove from queue on success
                await DatabaseService.runSql('DELETE FROM sync_queue WHERE id = ?', [item.id]);
                // console.log(`[Sync] Deleted item #${item.id} from queue`);
            } catch (error) {
                console.error(`[Sync] Error syncing queue item #${item.id}:`, error);

                const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                // Update retry count and error
                await DatabaseService.update('sync_queue', item.id, {
                    retry_count: item.retry_count + 1,
                    last_error: errorMessage,
                });

                // Remove from queue if too many retries
                if (item.retry_count >= 5) {
                    // console.log(`[Sync] Item #${item.id} exceeded retry limit, removing from queue`);
                    await DatabaseService.runSql('DELETE FROM sync_queue WHERE id = ?', [item.id]);
                }
            }
        }
    }

    private async syncQueueItem(item: SyncQueueItem): Promise<void> {
        const { operation, table_name, local_id, data } = item;

        // console.log(`[SyncItem] Starting sync: operation=${operation}, table=${table_name}, local_id=${local_id}`);

        if (table_name !== 'quiz_results') {
            throw new Error(`Unsupported table: ${table_name}`);
        }

        switch (operation) {
            case 'CREATE':
                if (!data) throw new Error('No data for CREATE operation');
                // console.log(`[SyncItem] Creating quiz result with data:`, data);
                await ApiService.submitQuizResult(JSON.parse(data));
                // console.log(`[SyncItem] Quiz result created successfully`);

                // Mark as synced in local DB
                if (local_id) {
                    // console.log(`[SyncItem] Marking quiz_results #${local_id} as synced`);
                    await DatabaseService.update(table_name, local_id, {
                        is_synced: 1,
                    });
                    // console.log(`[SyncItem] Quiz result #${local_id} marked as synced`);
                }
                break;

            case 'UPDATE':
            case 'DELETE':
                throw new Error(`Operation ${operation} not supported for quiz results`);
        }
    }

    async syncQuizResults(): Promise<void> {
        const unsynced = await DatabaseService.getUnsyncedQuizResults();
        for (const result of unsynced) {
            try {
                await ApiService.submitQuizResult({
                    quiz_id: result.quiz_id,
                    topic_id: result.topic_id,
                    chapter_id: result.chapter_id,
                    selected_option: result.selected_option,
                    is_correct: result.is_correct === 1,
                    time_taken_ms: result.time_taken_ms ?? undefined,
                    attempted_at: result.attempted_at,
                });
                await DatabaseService.markQuizResultSynced(result.id);
            } catch (err) {
                console.error('[Sync] Failed to sync quiz result', result.id, err);
            }
        }
    }
}

export default new SyncService();
