export interface EmbeddingsConfig {
  enabled: boolean;
  model?: string;
}

export const embeddingsConfig: EmbeddingsConfig = {
  enabled: false,
};

export async function loadEmbeddingsModel(): Promise<void> {
  throw new Error('Embeddings are not enabled. To enable semantic search, integrate transformers.js');
}

export async function generateEmbedding(text: string): Promise<number[]> {
  throw new Error('Embeddings are not enabled');
}

export function calculateCosineSimilarity(a: number[], b: number[]): number {
  throw new Error('Embeddings are not enabled');
}
