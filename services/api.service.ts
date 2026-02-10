import axios, { AxiosInstance } from 'axios';
import { ApiItem } from '../types/store';

const API_BASE_URL = 'https://your-backend-api.com/api';

class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add auth token if needed
        this.client.interceptors.request.use(async (config) => {
            // const token = await getAuthToken();
            // if (token && config.headers) {
            //   config.headers.Authorization = `Bearer ${token}`;
            // }
            return config;
        });
    }

    async createItem(data: any): Promise<ApiItem> {
        const response = await this.client.post<ApiItem>('/items', data);
        return response.data;
    }

    async updateItem(id: string, data: any): Promise<ApiItem> {
        const response = await this.client.put<ApiItem>(`/items/${id}`, data);
        return response.data;
    }

    async deleteItem(id: string): Promise<void> {
        await this.client.delete(`/items/${id}`);
    }

    async getUpdates(timestamp: number): Promise<ApiItem[]> {
        const response = await this.client.get<ApiItem[]>('/items/updates', {
            params: { since: timestamp },
        });
        return response.data;
    }
}

export default new ApiService();