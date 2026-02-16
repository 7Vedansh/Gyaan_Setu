import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from './database.service';
import ApiService from './api.service';
import { SyncQueueItem, SyncQueueInput } from '../types/store';

const SYNC_INTERVAL_KEY = 'last_sync_time';
const MIN_SYNC_INTERVAL = 30000; // 30 seconds minimum between syncs

/**
 * @abstract Methods to manage a queue which stores quiz results for syncing to MongoDB
 */
class SyncService {
    private isSyncing: boolean = false;
    private networkUnsubscribe: NetInfoSubscription | null = null;

    async addToQueue(queueItem: SyncQueueInput): Promise<void> {
        const data = {
            local_id: queueItem.local_id || null,
            table_name: queueItem.table_name,
            operation: queueItem.operation,
            data: queueItem.data || null,
            created_at: Date.now(),
            retry_count: 0,
        };

        console.log('[Queue] Adding item to sync queue:', { table: data.table_name, operation: data.operation, local_id: data.local_id });
        await DatabaseService.insert('sync_queue', data);
        console.log('[Queue] Item added to sync queue successfully');
    }

    /**
     * @abstract Keeps a watch on change in the network state (stable <-> unstable)
     */
    async startMonitoring(): Promise<void> {
        console.log('[Network Monitor] Starting network monitoring');
        this.networkUnsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
            console.log('[Network Monitor] Network state changed:', {
                isConnected: state.isConnected,
                isInternetReachable: state.isInternetReachable,
                type: state.type,
            });

            const shouldSync = this.shouldSync(state);
            console.log('[Network Monitor] Should sync?', shouldSync);

            if (shouldSync) {
                console.log('[Network Monitor] Network is good, triggering sync...');
                try {
                    await this.performSync();
                } catch (error) {
                    console.error('[Network Monitor] Sync error:', error);
                }
            }
        });
    }

    stopMonitoring(): void {
        if (this.networkUnsubscribe) {
            this.networkUnsubscribe();
        }
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
     * Run sync: process the sync queue (push quiz results to server).
     * @param force If true, skip the 30s throttle (e.g. when user taps "Sync now").
     */
    async performSync(force?: boolean): Promise<void> {
        if (this.isSyncing) {
            console.log('[Sync] Sync already in progress, skipping');
            throw new Error('Sync already in progress');
        }

        if (!force && !(await this.canSyncNow())) {
            console.log('[Sync] Throttled: Too soon since last sync');
            throw new Error('Too soon since last sync. Try again in a moment.');
        }

        this.isSyncing = true;
        console.log('[Sync] ===== START SYNC =====');

        try {
            await DatabaseService.init();
            console.log('[Sync] Database initialized');

            await this.processSyncQueue();

            await AsyncStorage.setItem(SYNC_INTERVAL_KEY, Date.now().toString());
            console.log('[Sync] ===== SYNC COMPLETED SUCCESSFULLY =====');
        } catch (error) {
            console.error('[Sync] ===== SYNC FAILED =====', error);
            throw error;
        } finally {
            this.isSyncing = false;
        }
    }

    private async processSyncQueue(): Promise<void> {
        const queueItems = await DatabaseService.getSyncQueue() as SyncQueueItem[];

        console.log(`[Sync] Processing ${queueItems.length} items in queue`);

        if (queueItems.length === 0) {
            console.log('[Sync] Queue is empty, nothing to sync');
            return;
        }

        for (const item of queueItems) {
            console.log(`[Sync] Processing queue item #${item.id}: ${item.operation} on ${item.table_name}`);
            try {
                await this.syncQueueItem(item);
                console.log(`[Sync] Successfully synced item #${item.id}`);

                // Remove from queue on success
                await DatabaseService.runSql('DELETE FROM sync_queue WHERE id = ?', [item.id]);
                console.log(`[Sync] Deleted item #${item.id} from queue`);
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
                    console.log(`[Sync] Item #${item.id} exceeded retry limit, removing from queue`);
                    await DatabaseService.runSql('DELETE FROM sync_queue WHERE id = ?', [item.id]);
                }
            }
        }
    }

    private async syncQueueItem(item: SyncQueueItem): Promise<void> {
        const { operation, table_name, local_id, data } = item;

        console.log(`[SyncItem] Starting sync: operation=${operation}, table=${table_name}, local_id=${local_id}`);

        if (table_name !== 'quiz_results') {
            throw new Error(`Unsupported table: ${table_name}`);
        }

        switch (operation) {
            case 'CREATE':
                if (!data) throw new Error('No data for CREATE operation');
                console.log(`[SyncItem] Creating quiz result with data:`, data);
                await ApiService.createQuizResult(JSON.parse(data));
                console.log(`[SyncItem] Quiz result created successfully`);

                // Mark as synced in local DB
                if (local_id) {
                    console.log(`[SyncItem] Marking quiz_results #${local_id} as synced`);
                    await DatabaseService.update(table_name, local_id, {
                        is_synced: 1,
                    });
                    console.log(`[SyncItem] Quiz result #${local_id} marked as synced`);
                }
                break;

            case 'UPDATE':
            case 'DELETE':
                throw new Error(`Operation ${operation} not supported for quiz results`);
        }
    }
}

export default new SyncService();