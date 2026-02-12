// Database Models
export interface Item {
    id: number;
    mongodb_id?: string | null;
    name: string;
    description?: string;
    data?: string; // JSON stringified data
    created_at: number;
    updated_at: number;
    is_synced: 0 | 1;
    is_deleted: 0 | 1;
}

export interface SyncQueueItem {
    id: number;
    local_id?: number;
    mongodb_id?: string | null;
    table_name: string;
    operation: SyncOperation;
    data?: string | null;
    created_at: number;
    retry_count: number;
    last_error?: string | null;
}

export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';

// API Models
export interface ApiItem {
    _id: string;
    name: string;
    description?: string;
    data?: any;
    createdAt: string;
    updatedAt: string;
}

export interface ItemInput {
    name: string;
    description?: string;
    data?: Record<string, any>;
}

// Network
export interface NetworkState {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    type: string;
    details?: {
        cellularGeneration?: '2g' | '3g' | '4g' | '5g' | null;
    };
}

// Sync Queue Input
export interface SyncQueueInput {
    local_id?: number;
    mongodb_id?: string;
    table_name: string;
    operation: SyncOperation;
    data?: string;
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