import { createClient } from '@supabase/supabase-js';
import { Logger } from './Logger';

export class VectorDBService {
  private supabase;
  private isConfigured: boolean = false;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrnrveehpyxurmkfgquc.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4jDpCA9GMSJaxxWOJv_b4g_LkN1q40E';
    
    this.isConfigured = true;
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async addDocuments(ids: string[], embeddings: number[][], metadatas: any[], documents: string[]) {
    if (!this.isConfigured) {
      Logger.warn('Supabase URL/Anon key is not configured. Skipping addDocuments.');
      return;
    }

    try {
      const records = ids.map((id, index) => ({
        id,
        content: documents[index],
        metadata: metadatas[index],
        embedding: embeddings[index],
      }));

      // Upsert into Supabase table 'website_documents'
      const { error } = await this.supabase
        .from('website_documents')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      Logger.info(`Upserted ${ids.length} documents into Supabase Vector DB.`);
    } catch (error) {
      Logger.error('Error adding documents to Supabase', error);
    }
  }

  async queryDocuments(queryEmbedding: number[], nResults: number = 3): Promise<any> {
    if (!this.isConfigured) {
      return { documents: [], metadatas: [] };
    }

    try {
      // Call the match_website_documents RPC function
      const { data, error } = await this.supabase.rpc('match_website_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5, // adjust this threshold as needed
        match_count: nResults,
      });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return { documents: [], metadatas: [] };
      }

      return {
        documents: [data.map((row: any) => row.content)],
        metadatas: [data.map((row: any) => row.metadata)],
      };
    } catch (error) {
      Logger.error('Error querying documents from Supabase', error);
      return { documents: [], metadatas: [] };
    }
  }
}

export const vectorDBService = new VectorDBService();
