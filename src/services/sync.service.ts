import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from './database.service';
import ApiService from './api.service';
import { SyncQueueItem, SyncQueueInput } from '../types/store';

const SYNC_INTERVAL_KEY = 'last_sync_time';
const MIN_SYNC_INTERVAL = 30000; // 30 seconds minimum between syncs

class SyncService {
    private isSyncing: boolean = false;
    private networkUnsubscribe: NetInfoSubscription | null = null;

    async addToQueue(queueItem: SyncQueueInput): Promise<void> {
        const data = {
            local_id: queueItem.local_id || null,
            mongodb_id: queueItem.mongodb_id || null,
            table_name: queueItem.table_name,
            operation: queueItem.operation,
            data: queueItem.data || null,
            created_at: Date.now(),
            retry_count: 0,
        };

        await DatabaseService.insert('sync_queue', data);
    }

    async startMonitoring(): Promise<void> {
        this.networkUnsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
            console.log('Network state changed:', state);

            if (this.shouldSync(state)) {
                await this.performSync();
            }
        });
    }

    stopMonitoring(): void {
        if (this.networkUnsubscribe) {
            this.networkUnsubscribe();
        }
    }

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

    private async canSyncNow(): Promise<boolean> {
        const lastSync = await AsyncStorage.getItem(SYNC_INTERVAL_KEY);
        if (!lastSync) return true;

        const timeSinceLastSync = Date.now() - parseInt(lastSync, 10);
        return timeSinceLastSync >= MIN_SYNC_INTERVAL;
    }

    async performSync(): Promise<void> {
        if (this.isSyncing) {
            console.log('Sync already in progress');
            return;
        }

        if (!(await this.canSyncNow())) {
            console.log('Too soon since last sync');
            return;
        }

        this.isSyncing = true;
        console.log('Starting sync...');

        try {
            // 1. Process sync queue
            await this.processSyncQueue();

            // 2. Pull updates from server
            await this.pullUpdates();

            // 3. Update last sync time
            await AsyncStorage.setItem(SYNC_INTERVAL_KEY, Date.now().toString());

            console.log('Sync completed successfully');
        } catch (error) {
            console.error('Sync error:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    private async processSyncQueue(): Promise<void> {
        const queueItems = await DatabaseService.getSyncQueue() as SyncQueueItem[];

        for (const item of queueItems) {
            try {
                await this.syncQueueItem(item);

                // Remove from queue on success
                await DatabaseService.query(
                    'DELETE FROM sync_queue WHERE id = ?',
                    [item.id]
                );
            } catch (error) {
                console.error('Error syncing queue item:', error);

                const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                // Update retry count and error
                await DatabaseService.update('sync_queue', item.id, {
                    retry_count: item.retry_count + 1,
                    last_error: errorMessage,
                });

                // Remove from queue if too many retries
                if (item.retry_count >= 5) {
                    await DatabaseService.query(
                        'DELETE FROM sync_queue WHERE id = ?',
                        [item.id]
                    );
                }
            }
        }
    }

    private async syncQueueItem(item: SyncQueueItem): Promise<void> {
        const { operation, table_name, local_id, data } = item;

        switch (operation) {
            case 'CREATE':
                if (!data) throw new Error('No data for CREATE operation');
                const createResult = await ApiService.createItem(JSON.parse(data));
                // Update local record with MongoDB ID
                if (local_id) {
                    await DatabaseService.update(table_name, local_id, {
                        mongodb_id: createResult._id,
                        is_synced: 1,
                    });
                }
                break;

            case 'UPDATE':
                if (!local_id) throw new Error('No local_id for UPDATE operation');
                if (!data) throw new Error('No data for UPDATE operation');

                const mongoId = await this.getMongoIdForLocal(table_name, local_id);
                if (mongoId) {
                    await ApiService.updateItem(mongoId, JSON.parse(data));
                    await DatabaseService.update(table_name, local_id, {
                        is_synced: 1,
                    });
                }
                break;

            case 'DELETE':
                if (!local_id) throw new Error('No local_id for DELETE operation');

                const deleteMongoId = await this.getMongoIdForLocal(table_name, local_id);
                if (deleteMongoId) {
                    await ApiService.deleteItem(deleteMongoId);
                }
                // Actually delete from local DB
                await DatabaseService.query(
                    `DELETE FROM ${table_name} WHERE id = ?`,
                    [local_id]
                );
                break;
        }
    }

    private async getMongoIdForLocal(tableName: string, localId: number): Promise<string | null> {
        const results = await DatabaseService.query<{ mongodb_id: string | null }>(
            `SELECT mongodb_id FROM ${tableName} WHERE id = ?`,
            [localId]
        );
        return results[0]?.mongodb_id || null;
    }

    private async pullUpdates(): Promise<void> {
        const lastSync = await AsyncStorage.getItem(SYNC_INTERVAL_KEY);
        const timestamp = lastSync ? parseInt(lastSync, 10) : 0;

        // Get updates from server since last sync
        const updates = await ApiService.getUpdates(timestamp);

        for (const update of updates) {
            // Check if item exists locally
            const existing = await DatabaseService.query<{ id: number }>(
                'SELECT id FROM items WHERE mongodb_id = ?',
                [update._id]
            );

            if (existing.length > 0) {
                // Update existing
                await DatabaseService.update('items', existing[0].id, {
                    name: update.name,
                    description: update.description || '',
                    data: JSON.stringify(update.data || {}),
                    updated_at: new Date(update.updatedAt).getTime(),
                    is_synced: 1,
                    mongodb_id: update._id,
                });
            } else {
                // Insert new
                await DatabaseService.insert('items', {
                    mongodb_id: update._id,
                    name: update.name,
                    description: update.description || '',
                    data: JSON.stringify(update.data || {}),
                    created_at: new Date(update.createdAt).getTime(),
                    updated_at: new Date(update.updatedAt).getTime(),
                    is_synced: 1,
                });
            }
        }
    }
}

export default new SyncService();