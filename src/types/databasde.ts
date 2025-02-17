// src/types/database.ts
export interface UserGeneration {
    id: string;
    user_id: string;
    generation: string;
    micro_generation?: string;
    created_at: string;
    updated_at: string;
}