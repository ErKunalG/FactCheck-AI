
import { GoogleGenAI, Type } from "@google/genai";
import { VerificationResult, FileData } from "./types";

const API_KEY = process.env.API_KEY || "";

export const analyzeContent = async (file: FileData): Promise<VerificationResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const isText = file.mimeType === 'text/plain';
  const isUrlOnly = !file.base64 && !isText;
  
  const basePrompt = `
    Analyze the provided input. 
    1. Authenticity/Source Check: 
       - If it's media, detect if it is AI-generated (0-100 likelihood). 
       - If it's text or a claim, assess if the statement itself sounds synthetic or like misinformation/propaganda.
    2. Fact-Checking: Extract specific factual claims. 
       For each claim, you MUST provide:
       - 'statement': A concise summary of the claim.
       - 'originalSentence': The exact words used.
       - 'timestamp': The approximate time (MM:SS) it appears (return 'N/A' for images or text).
       - 'status': 'Correct', 'Wrong', or 'Unverifiable' based on web grounding.
       - 'confidence': 0-100.
       - 'explanation': Brief reasoning behind the verification.
  `;

  let prompt = basePrompt;
  
  if (isText) {
    prompt = `Statement to verify: "${file.textContent}". ${basePrompt} Use Google Search to verify this specific statement/claim deeply.`;
  } else if (isUrlOnly) {
    prompt = `Link: ${file.previewUrl}. ${basePrompt} Use Google Search to research this specific link/content.`;
  }

  try {
    const parts: any[] = [{ text: prompt }];
    
    // Add image/video data if available
    if (!isText && !isUrlOnly && file.base64) {
      parts.unshift({
        inlineData: {
          data: file.base64,
          mimeType: file.mimeType,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiDetection: {
              type: Type.OBJECT,
              properties: {
                likelihood: { type: Type.NUMBER },
                reasoning: { type: Type.STRING },
                indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["likelihood", "reasoning", "indicators"],
            },
            claims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  statement: { type: Type.STRING },
                  originalSentence: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                  status: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                },
                required: ["id", "statement", "originalSentence", "timestamp", "status", "confidence", "explanation"],
              },
            },
          },
          required: ["aiDetection", "claims"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}") as any;
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || "Reference Source",
        uri: chunk.web.uri,
      }));

    return {
      aiDetection: result.aiDetection,
      claims: result.claims,
      groundingSources: sources,
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze content. Please try again.");
  }
};
