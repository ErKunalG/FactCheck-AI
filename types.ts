
export interface VerificationResult {
  aiDetection: {
    likelihood: number; // 0-100
    reasoning: string;
    indicators: string[];
  };
  claims: Claim[];
  groundingSources: GroundingSource[];
}

export interface Claim {
  id: string;
  statement: string; // Summarized claim
  originalSentence: string; // The actual spoken or written sentence
  timestamp: string; // Time in video or N/A for images
  status: 'Correct' | 'Wrong' | 'Unverifiable';
  confidence: number;
  explanation: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export type AppState = 'IDLE' | 'ANALYZING' | 'COMPLETED' | 'ERROR';

export interface FileData {
  base64?: string; // Optional for URL-based or text-based analysis
  mimeType: string;
  previewUrl: string; // Can be a blob URL, remote URL, or empty for text
  fileName: string; // Or "Text Input"
  isPlatformLink?: boolean;
  textContent?: string; // For text-only analysis
}
