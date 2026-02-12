import DatabaseService from './database.service';
import SyncService from './sync.service';
import { Item, ItemInput } from '../types/store';

class ItemService {
    async createItem(itemData: ItemInput): Promise<Item> {
        const timestamp = Date.now();

        const data = {
            name: itemData.name,
            description: itemData.description || '',
            data: JSON.stringify(itemData.data || {}),
            created_at: timestamp,
            updated_at: timestamp,
            is_synced: 0,
        };

        const localId = await DatabaseService.insert('items', data);

        // Add to sync queue
        await SyncService.addToQueue({
            local_id: localId,
            table_name: 'items',
            operation: 'CREATE',
            data: JSON.stringify(data),
        });

        return { id: localId, ...data, is_deleted: 0 } as Item;
    }

    async updateItem(id: number, itemData: Partial<ItemInput>): Promise<Item> {
        const timestamp = Date.now();

        const data: Record<string, any> = {
            updated_at: timestamp,
            is_synced: 0,
        };

        if (itemData.name !== undefined) data.name = itemData.name;
        if (itemData.description !== undefined) data.description = itemData.description;
        if (itemData.data !== undefined) data.data = JSON.stringify(itemData.data);

        await DatabaseService.update('items', id, data);

        // Add to sync queue
        await SyncService.addToQueue({
            local_id: id,
            table_name: 'items',
            operation: 'UPDATE',
            data: JSON.stringify(data),
        });

        const updatedItem = await this.getItemById(id);
        if (!updatedItem) throw new Error('Item not found after update');

        return updatedItem;
    }

    async deleteItem(id: number): Promise<void> {
        await DatabaseService.delete('items', id);

        // Add to sync queue
        await SyncService.addToQueue({
            local_id: id,
            table_name: 'items',
            operation: 'DELETE',
        });
    }

    async getItems(): Promise<Item[]> {
        return DatabaseService.query<Item>(
            'SELECT * FROM items WHERE is_deleted = 0 ORDER BY created_at DESC'
        );
    }

    async getItemById(id: number): Promise<Item | null> {
        const items = await DatabaseService.query<Item>(
            'SELECT * FROM items WHERE id = ? AND is_deleted = 0',
            [id]
        );
        return items[0] || null;
    }
}

export default new ItemService();