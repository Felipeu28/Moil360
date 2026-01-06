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
            description: "CRITICAL: Each prompt MUST be a direct, literal, photographic representation of the day's SPECIFIC topic. The image should instantly communicate the exact subject matter discussed in the post. Example: If topic is 'The $200/Hour Technician', show a professional service technician in branded uniform holding diagnostic tablet with visible pricing. If topic is 'Bilingual Revenue Multiplier', show a Hispanic technician speaking with homeowner with 'Se Habla Español' visible on truck. NO abstract concepts, NO generic stock photos, NO metaphors. The viewer should know the post topic just by seeing the image." 
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
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });
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
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });
    return ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        BUSINESS CONTEXT: ${JSON.stringify(business)}
        ${brandContext}
        MARKET RESEARCH DATA: ${researchText}
        TASK: Generate a 30-day "Juan-Style" Content Strategy.
        
        CRITICAL IMAGE PROMPT REQUIREMENTS:
        - Each image_prompt must LITERALLY show the exact topic being discussed
        - NO abstract concepts or metaphors
        - Include SPECIFIC visual elements that match the post content
        - Show real scenarios, people, tools, or products mentioned in the topic
        - Example: For "Bilingual Revenue Multiplier" → Show Hispanic technician with homeowner, 'Se Habla Español' on truck visible
        - Example: For "$200/Hour Technician" → Show professional technician with pricing tablet/invoice clearly visible
        - Example: For "Green Premium in Construction" → Show eco-friendly renovation with visible solar panels or insulation
        
        ${JUAN_STYLE_PROMPT}
      `,
      config: {
        systemInstruction: "Lead Content Architect. Strictly enforce aggressive white space. Create image prompts that DIRECTLY visualize the specific post topic with concrete, literal representations.",
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
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });
    return ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `REGENERATE DAY ${currentDay.day}. FEEDBACK: "${feedback}". Maintain "Juan-Style". Ensure image_prompts LITERALLY show the topic with specific, concrete visual elements. ${JUAN_STYLE_PROMPT}`,
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
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });
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

export async function generateAIImage(
  prompt: string, 
  feedback?: string, 
  existingBase64?: string, 
  engine: 'gemini' | 'qwen' = 'gemini',
  aspectRatio: '9:16' | '16:9' | '1:1' = '9:16'
): Promise<string> {
  const response: GenerateContentResponse = await retryableCall(async () => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });
    const parts: any[] = [];
    
    if (existingBase64 && feedback) {
      let base64Data: string;
      let mimeType: string = 'image/png';
      
      // Check if it's a URL or base64 data
      if (existingBase64.startsWith('http')) {
        // It's a URL - fetch and convert to base64
        console.log(`📥 Fetching image for editing from: ${existingBase64}`);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          const response = await fetch(existingBase64, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch image: HTTP ${response.status}`);
          }
          
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          
          // Convert to base64 in chunks
          let binary = '';
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
            binary += String.fromCharCode.apply(null, Array.from(chunk));
          }
          base64Data = btoa(binary);
          mimeType = blob.type || 'image/png';
          
          console.log(`✅ Image fetched and converted: ${base64Data.length} chars`);
        } catch (err: any) {
          if (err.name === 'AbortError') {
            throw new Error("Image fetch timeout. Please try again.");
          }
          throw new Error(`Cannot edit stored image: ${err.message}. Try generating a new image instead.`);
        }
      } else if (existingBase64.startsWith('data:')) {
        // It's a data URI - extract base64
        const matches = existingBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          throw new Error("Invalid data URI format");
        }
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        // Assume it's raw base64
        base64Data = existingBase64;
      }
      
      parts.push({ inlineData: { data: base64Data, mimeType } });
      parts.push({ text: `EDIT REQUEST: "${feedback}". Maintain composition and aspect ratio. Keep the core subject matter but apply the requested changes.` });
    } else {
      // Enhanced prompt for better topic representation
      parts.push({ 
        text: `${prompt}

CRITICAL REQUIREMENTS:
- This must be a direct, literal visual representation of the topic
- Show specific people, tools, scenarios, or products mentioned
- Professional commercial photography quality, 8k resolution
- Cinematic lighting and composition
- NO abstract concepts or metaphors
- The viewer should immediately understand the post topic from the image alone` 
      });
    }
    
    return ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio } }
    });
  });

  const data = response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
  if (!data) throw new Error("Rendering failed.");
  return `data:image/png;base64,${data}`;
}

export async function generateAIVideo(imageUri: string, topic: string, strategy: string): Promise<{ url: string, uri: string, blob: Blob }> {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });
  
  let base64Data: string;
  let mimeType: string = 'image/png';
  
  if (imageUri.startsWith('data:')) {
    // Data URI format
    const matches = imageUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid data URI format");
    }
    mimeType = matches[1];
    base64Data = matches[2];
  } else if (imageUri.startsWith('http')) {
    // URL format - fetch and convert with CORS and timeout handling
    try {
      console.log(`📥 Fetching image from URL: ${imageUri}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(imageUri, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log(`📦 Blob received: ${blob.size} bytes, type: ${blob.type}`);
      
      // Validate blob
      if (blob.size === 0) {
        throw new Error("Received empty blob from URL");
      }
      
      if (blob.size > 20 * 1024 * 1024) { // 20MB limit
        throw new Error("Image too large for video generation (max 20MB)");
      }
      
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in chunks for large files
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      base64Data = btoa(binary);
      
      mimeType = blob.type || 'image/png';
      console.log(`✅ Base64 conversion complete: ${base64Data.length} chars, mimeType: ${mimeType}`);
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error("Image fetch timeout (30s). Image may be too large or network too slow.");
      }
      throw new Error(`Failed to fetch image from URL: ${err.message}`);
    }
  } else {
    // Assume it's raw base64
    base64Data = imageUri;
  }
  
  // Validate base64 length
  if (base64Data.length === 0) {
    throw new Error("Empty base64 data - image conversion failed");
  }
  
  console.log(`🎬 Video generation starting with mimeType: ${mimeType}, base64 length: ${base64Data.length}`);
  
  const model = 'veo-3.1-fast-generate-preview';
  
  // ✅ FIX: Use correct API format with bytesBase64Encoded
  let operation = await ai.models.generateVideos({
    model,
    prompt: `Cinematic motion animation. ${topic}. Smooth camera movement, professional cinematography, engaging visual storytelling.`,
    image: { 
      bytesBase64Encoded: base64Data, 
      mimeType: mimeType 
    },
    config: { 
      numberOfVideos: 1, 
      resolution: '1080p', 
      aspectRatio: '9:16' 
    }
  });
  
  console.log(`🎬 Video operation started, polling for completion...`);
  
  // Poll for completion
  let pollCount = 0;
  const maxPolls = 60; // 10 minutes max
  
  while (!operation.done && pollCount < maxPolls) {
    await new Promise(r => setTimeout(r, 10000)); // Poll every 10 seconds
    const pollingAi = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });
    operation = await pollingAi.operations.getVideosOperation({ operation: operation });
    pollCount++;
    
    if (pollCount % 6 === 0) {
      console.log(`🎬 Still rendering... (${pollCount * 10}s elapsed)`);
    }
  }
  
  if (!operation.done) {
    throw new Error("Video generation timeout after 10 minutes");
  }
  
  const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!uri) {
    console.error("Video operation response:", JSON.stringify(operation.response, null, 2));
    throw new Error("Video render failed - no URI returned");
  }
  
  console.log(`✅ Video generated successfully: ${uri}`);
  
  const downloadUrl = `${uri}&key=${process.env.API_KEY}`;
  
  try {
    const resp = await vanguardFetch(downloadUrl, {}, 4);
    const blob = await resp.blob();
    console.log(`📥 Video downloaded: ${blob.size} bytes`);
    return { url: URL.createObjectURL(blob), uri, blob };
  } catch (err: any) {
    throw new Error(`Asset Retrieval Failed: ${err.message}`);
  }
}
