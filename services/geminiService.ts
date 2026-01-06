
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { BusinessInfo, ContentDay, MarketInsight, StrategyResult, MarketContext } from "../types";

const CONTENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Synthesis of 2026 market intelligence." },
    quality_score: { type: Type.INTEGER, description: "0-100 score." },
    context: {
      type: Type.OBJECT,
      properties: {
        seasonalFocus: { type: Type.STRING, description: "The overarching theme of this content cycle." },
        urgencyAngle: { type: Type.STRING, description: "The psychological lever used this month." },
        industryTrends: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific trends being leveraged." }
      },
      required: ["seasonalFocus", "urgencyAngle", "industryTrends"]
    },
    calendar: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          date: { type: Type.STRING },
          topic: { type: Type.STRING },
          hook: { type: Type.STRING },
          full_caption: { type: Type.STRING },
          cta: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          image_prompts: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Detailed, cinematic AI image prompts that perfectly visualize the specific day's content topic." 
          },
          content_type: { type: Type.STRING },
          platform_strategy: { type: Type.STRING },
          best_time: { type: Type.STRING },
          requires_video: { type: Type.BOOLEAN },
        },
        required: ["day", "date", "topic", "hook", "full_caption", "cta", "hashtags", "image_prompts", "content_type", "platform_strategy", "best_time", "requires_video"],
      },
    },
  },
  required: ["calendar", "summary", "quality_score", "context"],
};

const JUAN_STYLE_PROMPT = `
STRICT FORMATTING RULE: "Juan-Style"
1. AGGRESSIVE WHITE SPACE: Every single sentence MUST be followed by two newlines.
2. ONE SENTENCE PER PARAGRAPH. Never group two sentences together.
3. Use short, punchy, high-conversion language.
4. NO BULLET POINTS unless requested, even then, each bullet point is one short sentence.
5. DOUBLE SPACE BETWEEN EVERY LINE.
`;

export async function vanguardFetch(url: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> {
  if (window.location.protocol === 'https:' && url.startsWith('http:')) {
    throw new Error("SECURITY_PROTOCOL_MISMATCH: You are trying to fetch from an insecure (http) source while on a secure (https) site. Please use an https:// URL for your remote node.");
  }

  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown server error");
        if (response.status === 404 && errorText.includes("Requested entity was not found")) {
          throw new Error("VANGUARD_API_KEY_EXPIRED");
        }
        throw new Error(`HTTP_${response.status}: ${errorText.slice(0, 100)}`);
      }
      return response;
    } catch (err: any) {
      lastError = err;
      const isNetworkError = err instanceof TypeError || err.message?.toLowerCase().includes('fetch');
      
      if (isNetworkError && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        console.warn(`Vanguard: Network interruption. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      
      if (isNetworkError) {
        throw new Error("NETWORK_LINK_FAILURE: The intelligence node is unreachable. Ensure the URL is correct and your internet is stable.");
      }
      throw err;
    }
  }
  throw lastError;
}

function extractJson(text: string): any {
  if (!text) throw new Error("AI intelligence response was empty.");
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (e) {
    throw new Error("AI intelligence assembly failed to parse response.");
  }
}

async function retryableCall<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await fn();
      if (!result) throw new Error("AI returned empty result");
      return result;
    } catch (err: any) {
      lastError = err;
      const msg = err.message || String(err);
      
      if (msg.includes("Requested entity was not found") || msg.includes("VANGUARD_API_KEY_EXPIRED")) {
        console.warn("Project mismatch detected. Resetting key selection.");
        await window.aistudio.openSelectKey();
        throw new Error("API Key updated. Please retry the operation.");
      }

      if (msg.includes("Internal inconsistency") || msg.includes("Internal error") || msg.includes("500") || msg.includes("quota") || msg.includes("fetch")) {
        console.warn(`Transient AI error (Attempt ${i + 1}/${maxRetries + 1}): ${msg}`);
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function fetchRemoteStrategy(url: string): Promise<StrategyResult> {
  try {
    const response = await vanguardFetch(url, { method: 'GET', mode: 'cors' });
    const data = await response.json();
    const strategy = data.strategy || data;
    if (!strategy.calendar || !Array.isArray(strategy.calendar)) {
      throw new Error("Invalid format: Remote node did not return a valid content calendar.");
    }
    return {
      ...strategy,
      insights: strategy.insights || [],
      context: strategy.context || {
        today: new Date().toISOString().split('T')[0],
        seasonalFocus: "Remote Intelligence Sync",
        urgencyAngle: "N8N Node Active",
        industryTrends: []
      }
    };
  } catch (err: any) {
    throw new Error(`Remote Node Sync Failed: ${err.message || String(err)}`);
  }
}

export async function generateContentStrategy(business: BusinessInfo): Promise<StrategyResult> {
  const baseDate = business.startDate || new Date().toISOString().split('T')[0];
  const brandContext = business.brandDNA ? `BRAND IDENTITY: Colors ${business.brandDNA.primaryColor}, Tone: ${business.brandDNA.toneVoice}. Negative Keywords: ${business.brandDNA.negativeKeywords.join(', ')}.` : "";
  
  const research: GenerateContentResponse = await retryableCall(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        PERFORM AN EXHAUSTIVE MULTI-SOURCE MARKET SWEEP for the ${business.industry} industry starting from ${baseDate}. 
        Investigate trends using Google Search.
      `,
      config: { tools: [{ googleSearch: {} }] },
    });
  });

  const insights: MarketInsight[] = [];
  const chunks = research.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach(chunk => {
      if (chunk.web) insights.push({ title: chunk.web.title || "Intel Source", uri: chunk.web.uri || "" });
    });
  }

  const researchText = research.text || "Market synthesis grounded in real-time trends.";

  const response: GenerateContentResponse = await retryableCall(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        BUSINESS CONTEXT: ${JSON.stringify(business)}
        ${brandContext}
        MARKET RESEARCH DATA: ${researchText}
        TASK: Generate a 30-day "Juan-Style" Content Strategy.
        ${JUAN_STYLE_PROMPT}
      `,
      config: {
        systemInstruction: "Lead Content Architect. Strictly enforce aggressive white space.",
        responseMimeType: "application/json",
        responseSchema: CONTENT_SCHEMA,
      },
    });
  });

  if (!response?.text) throw new Error("Vanguard Engine returned an empty response.");
  
  const json = extractJson(response.text);
  const endDate = new Date(baseDate);
  endDate.setDate(endDate.getDate() + 30);

  return { 
    ...json, 
    insights, 
    context: { 
      today: baseDate, 
      endDate: endDate.toISOString().split('T')[0], 
      quarter: Math.ceil((new Date(baseDate).getMonth() + 1) / 3),
      seasonalFocus: json.context?.seasonalFocus || "Seasonal Growth",
      urgencyAngle: json.context?.urgencyAngle || "Market Opportunity",
      industryTrends: json.context?.industryTrends || []
    } 
  };
}

export async function regenerateDay(business: BusinessInfo, currentDay: ContentDay, feedback: string): Promise<ContentDay> {
  const response: GenerateContentResponse = await retryableCall(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `REGENERATE DAY ${currentDay.day}. FEEDBACK: "${feedback}". Maintain "Juan-Style". ${JUAN_STYLE_PROMPT}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: CONTENT_SCHEMA.properties.calendar.items,
      },
    });
  });
  if (!response?.text) throw new Error("Rewrite failed: Empty response from AI.");
  return extractJson(response.text);
}

export async function translateContent(hook: string, caption: string, targetLanguage: string): Promise<{ hook: string, caption: string }> {
  const response: GenerateContentResponse = await retryableCall(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: `Transcreate to ${targetLanguage}. MAINTAIN AGGRESSIVE WHITE SPACE. ${JUAN_STYLE_PROMPT} HOOK: "${hook}" CAPTION: "${caption}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { hook: { type: Type.STRING }, caption: { type: Type.STRING } },
          required: ["hook", "caption"]
        }
      }
    });
  });
  if (!response?.text) throw new Error("Translation failed.");
  return extractJson(response.text);
}

export async function generateAIImage(prompt: string, feedback?: string, existingBase64?: string, engine: 'gemini' | 'qwen' = 'gemini'): Promise<string> {
  const response: GenerateContentResponse = await retryableCall(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    if (existingBase64 && feedback) {
      const clean = existingBase64.includes(',') ? existingBase64.split(',')[1] : existingBase64;
      parts.push({ inlineData: { data: clean, mimeType: 'image/png' } });
      parts.push({ text: `EDIT: "${feedback}". Maintain composition.` });
    } else {
      parts.push({ text: `${prompt}. Professional commercial photography, 8k.` });
    }
    return ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio: "9:16" } }
    });
  });

  const data = response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
  if (!data) throw new Error("Rendering failed.");
  return `data:image/png;base64,${data}`;
}

export async function generateAIVideo(imageUri: string, topic: string, strategy: string): Promise<{ url: string, uri: string, blob: Blob }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = imageUri.split(',')[1];
  const model = 'veo-3.1-fast-generate-preview';
  
  let operation = await ai.models.generateVideos({
    model,
    prompt: `Cinematic motion. ${topic}.`,
    image: { imageBytes: base64Data, mimeType: 'image/png' },
    config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '9:16' }
  });
  
  while (!operation.done) {
    await new Promise(r => setTimeout(r, 10000));
    const pollingAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    operation = await pollingAi.operations.getVideosOperation({ operation: operation });
  }
  
  const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!uri) throw new Error("Video render failed.");
  
  const downloadUrl = `${uri}&key=${process.env.API_KEY}`;
  
  try {
    const resp = await vanguardFetch(downloadUrl, {}, 4);
    const blob = await resp.blob();
    return { url: URL.createObjectURL(blob), uri, blob };
  } catch (err: any) {
    throw new Error(`Asset Retrieval Failed: ${err.message}`);
  }
}
