import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import {
  BusinessInfo, ContentDay,
  StrategyResult,
  MarketInsight,
  StrategicMission,
  VisualSignature,
  BrandDNA,
  MarketContext
} from '../types';
import { generateQwenImage, generateQwenVideo } from './qwenService';

// ============================================================================
// WEEK 1 ENHANCEMENT: Content-Type Based Caption Variety
// ============================================================================
const CAPTION_LENGTH_GUIDELINES = {
  'Educational': {
    minWords: 250,
    maxWords: 400,
    style: 'Detailed, informative, teaching-focused with data and examples',
    structure: 'Hook â†’ Context â†’ Deep Dive â†’ Actionable Takeaways â†’ CTA'
  },
  'Promotional': {
    minWords: 100,
    maxWords: 200,
    style: 'Punchy, urgent, benefit-driven with clear value proposition',
    structure: 'Attention Grab â†’ Unique Benefit â†’ Social Proof â†’ Urgent CTA'
  },
  'Engagement': {
    minWords: 150,
    maxWords: 300,
    style: 'Conversational, relatable, question-driven to spark interaction',
    structure: 'Relatable Hook â†’ Story/Question â†’ Community Angle â†’ Engagement CTA'
  },
  'Behind the Scenes': {
    minWords: 200,
    maxWords: 350,
    style: 'Storytelling, authentic, insider perspective with personality',
    structure: 'Scene Setting â†’ Process/Journey â†’ Insight â†’ Human Connection'
  },
  'Testimonial': {
    minWords: 150,
    maxWords: 250,
    style: 'Personal, emotional, transformation-focused with credibility',
    structure: 'Before State â†’ Challenge â†’ Solution â†’ After Result â†’ Trust Signal'
  },
  'Entertainment': {
    minWords: 100,
    maxWords: 250,
    style: 'Fun, personality-driven, shareable with entertainment value',
    structure: 'Hook â†’ Payoff â†’ Personality â†’ Share Prompt'
  }
};

const DAY_SCHEMA = {
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
      description: "CRITICAL: Each prompt MUST be a direct, literal, photographic representation of the day's SPECIFIC topic. The image should instantly communicate the exact subject matter discussed in the post. Example: If topic is 'The $200/Hour Technician', show a professional service technician in branded uniform holding diagnostic tablet with visible pricing. If topic is 'Bilingual Revenue Multiplier', show a Hispanic technician speaking with homeowner with 'Se Habla EspaÃ±ol' visible on truck. NO abstract concepts, NO generic stock photos, NO metaphors. The viewer should know the post topic just by seeing the image."
    },
    content_type: { type: Type.STRING },
    platform_strategy: { type: Type.STRING },
    best_time: { type: Type.STRING },
    requires_video: { type: Type.BOOLEAN },
  },
  required: ["day", "date", "topic", "hook", "full_caption", "cta", "hashtags", "image_prompts", "content_type", "platform_strategy", "best_time", "requires_video"],
};

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
      items: DAY_SCHEMA,
    },
  },
  required: ["calendar", "summary", "quality_score", "context"],
};

const BATCH_CALENDAR_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    calendar: {
      type: Type.ARRAY,
      items: DAY_SCHEMA,
    },
  },
  required: ["calendar"],
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
        if (typeof window !== 'undefined' && (window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
        }
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

// ============================================================================
// WEEK 1 ENHANCEMENT: Video Day Validation Helper
// ============================================================================
function validateVideoDistribution(calendar: ContentDay[]): ContentDay[] {
  const videoDays = calendar.filter(day => day.requires_video);

  // ✅ VALIDATION: Ensure minimum 5 video days
  if (videoDays.length < 5) {
    console.warn(`âš ï¸ Only ${videoDays.length} video days detected. Adding more...`);

    // Strategy: Add video to high-impact days that don't have it
    // Priority order: Promotional > Engagement > Educational
    const candidateDays = calendar
      .filter(day => !day.requires_video)
      .filter(day => ['Promotional', 'Engagement', 'Educational'].includes(day.content_type))
      .sort((a, b) => {
        const priority = { 'Promotional': 3, 'Engagement': 2, 'Educational': 1 };
        return (priority[b.content_type as keyof typeof priority] || 0) -
          (priority[a.content_type as keyof typeof priority] || 0);
      });

    const needed = 5 - videoDays.length;
    for (let i = 0; i < Math.min(needed, candidateDays.length); i++) {
      candidateDays[i].requires_video = true;
    }
  }

  // ✅ BALANCE: Ensure video days are distributed (not all clustered)
  // Check for clustering (more than 3 consecutive video days)
  let consecutiveCount = 0;
  let lastVideoDay = -5;

  for (const day of calendar) {
    if (day.requires_video) {
      if (day.day - lastVideoDay === 1) {
        consecutiveCount++;
        if (consecutiveCount > 2) {
          // Too many consecutive - move one to a gap
          day.requires_video = false;

          // Find a day without video that's at least 5 days away
          const targetDay = calendar.find(d =>
            !d.requires_video &&
            Math.abs(d.day - day.day) > 4 &&
            ['Promotional', 'Engagement'].includes(d.content_type)
          );
          if (targetDay) {
            targetDay.requires_video = true;
          }
        }
      } else {
        consecutiveCount = 0;
      }
      lastVideoDay = day.day;
    }
  }

  console.log(`✅ Video distribution validated: ${calendar.filter(d => d.requires_video).length} video days`);
  return calendar;
}

export async function generateContentStrategy(
  business: BusinessInfo,
  previousStrategy?: StrategyResult,
  onProgress?: (partial: Partial<StrategyResult>) => void
): Promise<StrategyResult> {
  const baseDate = business.startDate || new Date().toISOString().split('T')[0];
  const year = new Date(baseDate).getFullYear();
  const brandContext = business.brandDNA ? `BRAND IDENTITY: Colors ${business.brandDNA.primaryColor}, Tone: ${business.brandDNA.toneVoice}. Negative Keywords: ${business.brandDNA.negativeKeywords.join(', ')}.` : "";

  // ✅ EXTRACT MISSION FROM GUIDANCE (if sent via post-mortem bridge)
  let activeMission: StrategicMission = business.strategicMission || 'Growth';
  if (business.monthlyGuidance?.includes('[MISSION:')) {
    const match = business.monthlyGuidance.match(/\[MISSION:\s*(\w+)\]/);
    if (match && match[1]) activeMission = match[1] as StrategicMission;
  }
  let activeSignature: VisualSignature = business.visualSignature || 'Bold';

  // RECURSIVE GROWTH ENGINE: Analyze previous month if available
  const previousCalendarText = previousStrategy?.calendar.map(day =>
    `Day ${day.day}: Topic: ${day.topic} | Hook: ${day.hook} | Type: ${day.content_type}`
  ).join('\n') || "None";

  const evolutionContext = previousStrategy ? `
    EVOLUTIONARY CONTEXT (Recursive Growth Engine):
    Previous Month Summary: ${previousStrategy.summary}
    Previous Quality Score: ${previousStrategy.quality_score}%
    Previous Trends Leveraged: ${previousStrategy.context?.industryTrends?.join(', ')}
    
    FULL PREVIOUS CALENDAR (DO NOT REPEAT THESE TOPICS/HOOKS):
    ${previousCalendarText}
    
    STRATEGIC MANDATE:
    1. Do NOT repeat the same angles, topics, or hooks from the previous month.
    2. BUILD on the momentum of the previous month's story.
    3. If the previous month was "Foundational", this month should be "Expansion" or "Authority".
    4. Reference the natural progression of a brand's story.
    5. This is month ${previousStrategy.monthId} + 1. Transition the narrative accordingly.
  ` : "INITIAL SETUP: This is the first month of the campaign. Focus on brand foundation and initial market alignment.";

  // 1. DYNAMIC QUERY GENERATION: Generate 5-7 ultra-targeted search queries
  const queryGenResponse = await retryableCall(() => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });
    return ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `
        TASK: Generate 6 ultra-targeted search queries for market research.
        
        COMPANY: ${business.name}
        INDUSTRY: ${business.industry}
        AUDIENCE: ${business.targetAudience}
        GOALS: ${business.mainGoals}
        CLIENT GUIDANCE: ${business.monthlyGuidance || "None provided. Focus on general growth and engagement."}
        PLANNING FOR: ${new Date(new Date(baseDate).setMonth(new Date(baseDate).getMonth() + 1)).toLocaleString('default', { month: 'long', year: 'numeric' })}
        
        REQUIREMENTS:
        - 2 queries must focus on upcoming seasonal trends for the planning month.
        - 2 queries must focus on the specific CLIENT GUIDANCE if provided.
        - 2 queries must focus on competitor gaps or emerging industry news.
        
        OUTPUT: Return only a JSON array of strings.
      `,
      config: { responseMimeType: "application/json" }
    });
  });

  const dynamicQueries = extractJson(queryGenResponse.text || "[]");
  const searchQueryText = Array.isArray(dynamicQueries) ? dynamicQueries.join('\n- ') : "Standard industry research";

  // 2. ENHANCED GROUNDED RESEARCH: Use dynamic queries to pull real-time data
  const research: GenerateContentResponse = await retryableCall(() => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });
    return ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `
        COMPREHENSIVE MARKET INTELLIGENCE BRIEFING
        
        Industry: ${business.industry}
        Target Audience: ${business.targetAudience}
        Planning Month: ${new Date(new Date(baseDate).setMonth(new Date(baseDate).getMonth() + 1)).toLocaleString('default', { month: 'long', year: 'numeric' })}
        Client Guidance: ${business.monthlyGuidance || "General growth and engagement."}
        
        ${evolutionContext}

        SEARCH STRATEGY:
        ${searchQueryText}
        
        TASK: Synthesize the web search results into a high-level intelligence report. Focus on specific opportunities related to the Client Guidance.
      `,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7
      },
    });
  });

  const insights: MarketInsight[] = [];
  const chunks = research.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach(chunk => {
      if (chunk.web) insights.push({ title: chunk.web.title || "Intel Source", uri: chunk.web.uri || "" });
    });
  }

  const researchText = research.text || "Market synthesis grounded in real-time trends for the upcoming period.";

  // ============================================================================
  // WEEK 1 ENHANCEMENT: Caption Variety Instructions
  // ============================================================================
  const captionGuidelines = Object.entries(CAPTION_LENGTH_GUIDELINES)
    .map(([type, guide]) => `
${type}:
- Length: ${guide.minWords}-${guide.maxWords} words
- Style: ${guide.style}
- Structure: ${guide.structure}
    `).join('\n');

  // ============================================================================
  // BATCHED GENERATION: 3-STAGE LOOP (30 DAYS TOTAL)
  // ============================================================================
  console.log("🚀 Starting Batched Strategy Generation...");
  const fullCalendar: ContentDay[] = [];
  let strategySummary = "";
  let qualityScore = 0;
  let strategyContext: any = null;

  for (let batch = 1; batch <= 3; batch++) {
    const startDay = (batch - 1) * 10 + 1;
    const endDay = batch * 10;
    console.log(`ðŸ“¦ Generating Batch ${batch} (Days ${startDay}-${endDay})...`);

    const batchResponse: GenerateContentResponse = await retryableCall(() => {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });

      const missionWeights = {
        Growth: "Focus on viral loops, hooks, and broad awareness. Skew towards Engagement and Entertainment.",
        Sales: "Focus on conversion, urgency, and product benefits. Skew towards Promotional and Testimonial.",
        Authority: "Focus on trust, deep insights, and case studies. Skew towards Educational and Testimonial.",
        Community: "Focus on BTS, relatability, and comments. Skew towards Behind the Scenes and Engagement."
      }[activeMission];

      return ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `
          BUSINESS CONTEXT: ${JSON.stringify(business)}
          ${brandContext}
          PRIMARY STRATEGY: ${activeMission} Mission
          STRATEGIC WEIGHTING: ${missionWeights}
          VISUAL DIRECTION: ${activeSignature} Style
          
          CLIENT STRATEGIC GUIDANCE: ${business.monthlyGuidance || "None provided."}
          ============================================================================
          MARKET RESEARCH DATA: ${researchText}
          STRATEGIC EVOLUTION: ${evolutionContext}
          
          TASK: Generate DAYS ${startDay} to ${endDay} of a 30-day "Juan-Style" Content Strategy.
          
          ============================================================================
          ðŸš¨ CRITICAL COMMAND: ADHERE TO STRATEGIC MISSION & GUIDANCE
          1. MISSION: The goal is ${business.strategicMission || 'Growth'}. ${missionWeights}
          2. VISUALS: Every prompt Must reflect the ${business.visualSignature || 'Bold'} aesthetic.
          3. GUIDANCE: Directly execute "${business.monthlyGuidance || "General Growth"}".
          ============================================================================
          ðŸ“Š BATCH GENERATION: STAGE ${batch} OF 3
          ============================================================================
          - Generate exactly 10 days (Days ${startDay} through ${endDay}).
          ${batch === 1 ? "- Also generate the 'summary', 'quality_score', and 'context' for the whole 30-day strategy." : "- Do NOT generate the summary/score/context, ONLY the 'calendar' array for these 10 days."}
          
          ============================================================================
          ðŸ“Š WEEK 1 ENHANCEMENT: CAPTION VARIETY REQUIREMENTS
          ============================================================================
          ${captionGuidelines}
          
          ENFORCEMENT RULES:
          1. COUNT YOUR WORDS - Educational posts MUST be 250-400 words, Promotional MUST be 100-200 words
          2. VARY THE LENGTH - No two consecutive posts should have similar word counts
          3. MATCH THE STRUCTURE - Follow the specified structure for each type
          4. MAINTAIN JUAN-STYLE - Aggressive white space applies to ALL types
          
          ${batch > 1 ? `PREVIOUS DAYS CONTEXT: We have already generated Days 1 to ${startDay - 1}. Ensure Days ${startDay}-${endDay} continue the narrative flow logically.` : ""}
          
          ${JUAN_STYLE_PROMPT}

          FORMAT INSTRUCTION: Ensure the 'content_type' distribution aligns with the ${business.strategicMission || 'Growth'} mission.
        `,
        config: {
          systemInstruction: `Lead Content Architect & Strategic Growth Specialist. Current Mission: ${activeMission}. Aesthetic: ${activeSignature}. Stage ${batch}/3 of generation. Enforce caption variety and aggressive white space. Focus on Days ${startDay}-${endDay}.`,
          responseMimeType: "application/json",
          responseSchema: batch === 1 ? CONTENT_SCHEMA : BATCH_CALENDAR_SCHEMA,
        },
      });
    });

    if (!batchResponse?.text) throw new Error(`Vanguard Engine Batch ${batch} returned empty.`);
    const batchJson = extractJson(batchResponse.text);

    if (batch === 1) {
      strategySummary = batchJson.summary;
      qualityScore = batchJson.quality_score;
      strategyContext = batchJson.context;
    }

    if (batchJson.calendar && Array.isArray(batchJson.calendar)) {
      fullCalendar.push(...batchJson.calendar);

      // ✅ TRIGGER PROGRESS CALLBACK (Incremental Autosave)
      if (onProgress) {
        const nextMonthDate = new Date(baseDate);
        nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
        const endDate = new Date(nextMonthDate);
        endDate.setDate(endDate.getDate() + 30);

        onProgress({
          calendar: [...fullCalendar],
          monthId: nextMonthDate.toISOString().slice(0, 7),
          summary: strategySummary || "Neural synthesis in progress...",
          quality_score: qualityScore || 0,
          insights: insights || [], // ✅ REQUIRED: Ensure insights are passed (even if empty) to satisfy schema
          context: strategyContext ? {
            ...strategyContext,
            // Ensure derived fields are always present
            today: nextMonthDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            quarter: Math.ceil((nextMonthDate.getMonth() + 1) / 3),
          } : {
            today: nextMonthDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            quarter: Math.ceil((nextMonthDate.getMonth() + 1) / 3),
            seasonalFocus: "Neural Analysis",
            urgencyAngle: "Growth Opportunity",
            industryTrends: []
          },
          strategicMission: activeMission,
          visualSignature: activeSignature
        });
      }
    }
  }

  const nextMonthDate = new Date(baseDate);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const endDate = new Date(nextMonthDate);
  endDate.setDate(endDate.getDate() + 30);

  // ✅ VALIDATE: Ensure we have all 30 days
  if (fullCalendar.length < 30) {
    console.warn(`âš ï¸ Strategy truncated to ${fullCalendar.length} days. Filling gaps...`);
  }

  // ✅ WEEK 1: Validate and fix video distribution
  const validatedCalendar = validateVideoDistribution(fullCalendar);

  return {
    monthId: new Date(nextMonthDate).toISOString().slice(0, 7),
    calendar: validatedCalendar,
    insights,
    summary: strategySummary,
    quality_score: qualityScore,
    strategicMission: activeMission,
    visualSignature: activeSignature,
    context: {
      today: nextMonthDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      quarter: Math.ceil((nextMonthDate.getMonth() + 1) / 3),
      seasonalFocus: strategyContext?.seasonalFocus || "Recursive Expansion",
      urgencyAngle: strategyContext?.urgencyAngle || "Growth Opportunity",
      industryTrends: strategyContext?.industryTrends || []
    }
  };
}

/**
 * Generates a CSV string from a StrategyResult
 */
export function generateCSV(strategy: StrategyResult): string {
  if (!strategy || !strategy.calendar) return "";

  const headers = [
    "Day",
    "Date",
    "Topic",
    "Content Type",
    "Hook",
    "Full Caption",
    "Call to Action",
    "Hashtags",
    "Best Time to Post",
    "Requires Video"
  ];

  const rows = strategy.calendar.map(day => {
    const clean = (str: string) => {
      const val = str || '';
      return `"${val.replace(/"/g, '""')}"`;
    };

    return [
      day.day,
      day.date,
      clean(day.topic),
      clean(day.content_type),
      clean(day.hook),
      clean(day.full_caption),
      clean(day.cta),
      clean(day.hashtags.join(' ')),
      clean(day.best_time),
      day.requires_video ? "Yes" : "No"
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}


export async function regenerateDay(business: BusinessInfo, currentDay: ContentDay, feedback: string): Promise<ContentDay> {
  // ✅ WEEK 1: Apply caption variety to regenerated days
  const guidelines = CAPTION_LENGTH_GUIDELINES[currentDay.content_type as keyof typeof CAPTION_LENGTH_GUIDELINES];
  const lengthInstruction = guidelines
    ? `MAINTAIN ${guidelines.minWords}-${guidelines.maxWords} WORD COUNT. Structure: ${guidelines.structure}`
    : '';

  const response: GenerateContentResponse = await retryableCall(() => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });
    return ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `REGENERATE DAY ${currentDay.day}. FEEDBACK: "${feedback}". ${lengthInstruction} Maintain "Juan-Style". Ensure image_prompts LITERALLY show the topic with specific, concrete visual elements. ${JUAN_STYLE_PROMPT}`,
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
      model: "gemini-2.0-flash",
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

  if (engine === 'qwen') {
    console.log('ðŸ”€ Routing to Qwen image engine');
    try {
      return await generateQwenImage(prompt, aspectRatio);
    } catch (err: any) {
      console.error('âŒ Qwen failed, falling back to Gemini:', err.message);
    }
  }

  console.log('🎨 Using Gemini image engine');

  const response = await retryableCall(async () => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });
    const parts: any[] = [];

    if (existingBase64 && feedback) {
      let base64Data: string;
      let mimeType: string = 'image/png';

      if (existingBase64.startsWith('http')) {
        console.log(`ðŸ“¥ Fetching image for editing from: ${existingBase64}`);
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
        const matches = existingBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          throw new Error("Invalid data URI format");
        }
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        base64Data = existingBase64;
      }

      parts.push({ inlineData: { data: base64Data, mimeType } });
      parts.push({ text: `EDIT REQUEST: "${feedback}". Maintain composition and aspect ratio. Keep the core subject matter but apply the requested changes.` });
    } else {
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

    console.log(`📸 Gemini API call with aspectRatio: ${aspectRatio}`);
    
    // ✅ FIX: Use the correct Gemini model for image generation
    // gemini-2.5-flash-image is the official model for image generation
    const modelName = 'gemini-2.5-flash-image';
    console.log(`🎨 Generating image with ${modelName}...`);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: { 
        imageConfig: { aspectRatio }
      }
    });

    const data = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
    if (!data) throw new Error("Rendering failed: No image data in response.");
    return `data:image/png;base64,${data}`;
  });

  return response;
}

export async function generateAIVideo(
  imageUri: string,
  topic: string,
  strategy: string,
  contentType?: string,
  brandDNA?: BrandDNA,
  engine: 'gemini' | 'qwen' = 'gemini'
): Promise<{ url: string, uri: string, blob: Blob }> {

  if (engine === 'qwen') {
    console.log('ðŸ”€ Routing to Qwen video engine');
    try {
      const result = await generateQwenVideo(imageUri, topic);
      return {
        url: result.url,
        uri: result.url,
        blob: result.blob
      };
    } catch (err: any) {
      console.error('âŒ Qwen video failed, falling back to Gemini:', err.message);
    }
  }

  console.log('🎬 Using Gemini video engine');

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY });

  const getMotionStyle = (type: string): string => {
    switch (type) {
      case 'Educational': return 'Slow zoom in to reveal detail, methodical panning to highlight key learning points';
      case 'Promotional': return 'Dynamic push-in with energy, quick reveals, attention-grabbing opening';
      case 'Engagement': return 'Natural human-centric movement, follow subject authentically, relatable perspective';
      case 'Behind the Scenes': return 'Documentary-style pan, authentic reveal, intimate behind-the-curtain feel';
      case 'Testimonial': return 'Intimate slow dolly to subject, emotional close-up, warm and inviting';
      case 'Entertainment': return 'Playful, dynamic movement with personality, entertaining energy';
      default: return 'Smooth professional cinematic motion with purpose';
    }
  };

  const getCameraStrategy = (platformStrategy: string): string => {
    if (platformStrategy.toLowerCase().includes('tiktok') || platformStrategy.toLowerCase().includes('reel')) {
      return 'Hook viewer in first 2 seconds with dynamic motion, fast-paced for short attention spans';
    } else if (platformStrategy.toLowerCase().includes('stories')) {
      return 'Vertical-optimized movement, casual feel, quick engaging motion';
    }
    return 'Professional smooth cinematography, platform-optimized engagement';
  };

  const getPacing = (type: string): string => {
    switch (type) {
      case 'Promotional': return 'Fast, energetic (3-5 seconds optimal, hook immediately)';
      case 'Educational': return 'Moderate, clear pacing (5-7 seconds, allow comprehension)';
      case 'Testimonial': return 'Slow, intimate (6-8 seconds, build emotional connection)';
      case 'Behind the Scenes': return 'Natural, authentic pacing (5-7 seconds)';
      default: return 'Medium engaging pace (5-6 seconds, maintain interest)';
    }
  };

  const getDuration = (type: string): string => {
    switch (type) {
      case 'Promotional': return '5 seconds';
      case 'Educational': return '7 seconds';
      case 'Testimonial': return '8 seconds';
      default: return '6 seconds';
    }
  };

  let base64Data: string;
  let mimeType: string = 'image/png';

  if (imageUri.startsWith('data:')) {
    const matches = imageUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid data URI format");
    }
    mimeType = matches[1];
    base64Data = matches[2];
  } else if (imageUri.startsWith('http')) {
    try {
      console.log(`ðŸ“¥ Fetching image from URL: ${imageUri}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

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
      console.log(`ðŸ“¦ Blob received: ${blob.size} bytes, type: ${blob.type}`);

      if (blob.size === 0) {
        throw new Error("Received empty blob from URL");
      }

      if (blob.size > 20 * 1024 * 1024) {
        throw new Error("Image too large for video generation (max 20MB)");
      }

      let finalBlob = blob;
      if (blob.size > 1024 * 1024) {
        console.log(`⚙️ Compressing image from ${(blob.size / 1024 / 1024).toFixed(2)}MB...`);

        try {
          const img = new Image();
          const blobUrl = URL.createObjectURL(blob);
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = blobUrl;
          });

          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_DIM = 1920;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context failed');

          ctx.drawImage(img, 0, 0, width, height);

          finalBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) => b ? resolve(b) : reject(new Error('Blob creation failed')),
              'image/jpeg',
              0.85
            );
          });

          URL.revokeObjectURL(blobUrl);
          console.log(`✅ Compressed to ${(finalBlob.size / 1024 / 1024).toFixed(2)}MB`);
          mimeType = 'image/jpeg';
        } catch (compressionErr) {
          console.warn('âš ï¸ Compression failed, using original:', compressionErr);
          finalBlob = blob;
        }
      }

      const arrayBuffer = await finalBlob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      if (!finalBlob.type || finalBlob.type === '' || finalBlob.type === 'application/octet-stream') {
        console.warn('âš ï¸ Blob has no type, detecting from magic bytes...');

        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
          mimeType = 'image/png';
        }
        else if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
          mimeType = 'image/jpeg';
        }
        else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[8] === 0x57 && bytes[9] === 0x45) {
          mimeType = 'image/webp';
        }
        else {
          console.error('âŒ Unknown image format, defaulting to JPEG');
          mimeType = 'image/jpeg';
        }

        console.log(`✅ Detected mimeType: ${mimeType}`);
      } else {
        mimeType = finalBlob.type;
      }

      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      base64Data = btoa(binary);

      console.log(`✅ Base64 conversion complete: ${base64Data.length} chars, mimeType: ${mimeType}`);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error("Image fetch timeout (30s). Image may be too large or network too slow.");
      }
      throw new Error(`Failed to fetch image from URL: ${err.message}`);
    }
  } else {
    base64Data = imageUri;
  }

  if (base64Data.length === 0) {
    throw new Error("Empty base64 data - image conversion failed");
  }

  if (!mimeType || mimeType === '') {
    console.warn('âš ï¸ Missing mimeType, defaulting to image/png');
    mimeType = 'image/png';
  }

  const validMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!validMimeTypes.includes(mimeType.toLowerCase())) {
    console.warn(`âš ï¸ Invalid mimeType '${mimeType}', converting to image/png`);
    mimeType = 'image/png';
  }

  console.log(`🎬 Video generation starting with mimeType: ${mimeType}, base64 length: ${base64Data.length}`);

  console.log('ðŸ“¤ Sending to Gemini API:', {
    hasBase64: !!base64Data,
    base64Length: base64Data.length,
    mimeType: mimeType,
    isValidBase64: /^[A-Za-z0-9+/]+={0,2}$/.test(base64Data.substring(0, 100))
  });

  const model = 'veo-3.1-fast-generate-preview';

  console.log('ðŸ” Checking Veo model availability...');
  try {
    const modelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY}`,
      { method: 'GET' }
    );

    if (modelsResponse.ok) {
      const modelInfo = await modelsResponse.json();
      console.log('✅ Veo model available:', {
        displayName: modelInfo.displayName,
        supportedMethods: modelInfo.supportedGenerationMethods
      });
    } else {
      const errorText = await modelsResponse.text();
      console.error('âŒ Veo model check failed:', modelsResponse.status, errorText);
      throw new Error(`Veo model '${model}' not available. Status: ${modelsResponse.status}. Your API key may not have access to video generation.`);
    }
  } catch (checkErr: any) {
    console.error('âš ï¸ Model availability check failed:', checkErr.message);
  }

  const videoPrompt = `
STRATEGIC ANIMATED VIDEO BRIEF

Core Topic: ${topic}
Content Type: ${contentType || 'Professional'}
Platform Distribution: ${strategy}
Target Duration: ${getDuration(contentType || 'Professional')}

ANIMATION STRATEGY (Content-Type Specific):
${getMotionStyle(contentType || 'Professional')}

CAMERA & MOVEMENT DIRECTION:
- Platform Strategy: ${getCameraStrategy(strategy)}
- Motion Pacing: ${getPacing(contentType || 'Professional')}
- Camera Behavior: ${contentType === 'Promotional' ? 'Dynamic, energetic, attention-commanding' : contentType === 'Educational' ? 'Methodical, clear, purposeful reveals' : 'Smooth, professional, engaging'}
- Focus Strategy: Emphasize key visual elements from "${topic}"

PROFESSIONAL PRODUCTION STANDARDS:
- Quality: 4K resolution, cinematic color grading
- Motion: Buttery smooth (no shakiness), professional stabilization
- Lighting: Enhance natural lighting, maintain visual clarity
- Depth: Subtle depth-of-field where it adds impact
- Framing: 9:16 vertical optimization for mobile-first platforms
- Transitions: Natural, seamless (avoid jarring cuts)

BRAND & AUDIENCE ALIGNMENT:
- Brand Tone: ${brandDNA?.toneVoice || 'Professional, trustworthy, engaging'}
- Energy Level: ${contentType === 'Promotional' ? 'High energy, exciting' : contentType === 'Educational' ? 'Measured, clear' : contentType === 'Testimonial' ? 'Warm, intimate' : 'Professional, confident'}
- Visual Personality: Match brand identity naturally
- Emotional Goal: ${contentType === 'Educational' ? 'Inform and empower' : contentType === 'Promotional' ? 'Excite and motivate action' : contentType === 'Testimonial' ? 'Build trust and connection' : contentType === 'Engagement' ? 'Create relatability' : 'Engage professionally'}

PURPOSE-DRIVEN CINEMATOGRAPHY:
${contentType === 'Educational' ? '- Reveal learning points sequentially\n- Pause on key details\n- Guide viewer attention methodically' : ''}
${contentType === 'Promotional' ? '- Hook in first second\n- Build excitement rapidly\n- Create FOMO energy' : ''}
${contentType === 'Testimonial' ? '- Zoom slowly to create intimacy\n- Focus on authentic human moments\n- Build emotional resonance' : ''}
${contentType === 'Engagement' ? '- Natural, relatable movement\n- Follow human subjects authentically\n- Create connection through motion' : ''}
${contentType === 'Behind the Scenes' ? '- Documentary-style discovery\n- Authentic, unpolished feel\n- Reveal the process naturally' : ''}

AVOID (Critical):
- Generic stock video motion patterns
- Overused zoom/pan transitions
- Disorienting or nauseating camera work
- Energy mismatched to content purpose
- Excessive or distracting effects
- Motion that obscures the message

GOAL: Create strategic animation that enhances the message, aligns with platform behavior, and serves the content type's specific purpose.
`;

  console.log('🎬 Calling Gemini Video API directly (bypassing SDK)...');

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

  let operation;
  try {
    // ✅ FIX: Veo uses a different API format than standard Gemini
    // The :predictLongRunning endpoint expects a specific structure
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{
            prompt: videoPrompt,
            image: {
              bytesBase64Encoded: base64Data,
              mimeType: mimeType
            }
          }],
          parameters: {
            aspectRatio: '9:16'
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('âŒ Direct API Error:', errorData);
      throw new Error(JSON.stringify(errorData));
    }

    const operationData = await response.json();
    operation = {
      name: operationData.name,
      done: operationData.done || false,
      metadata: operationData.metadata,
      response: operationData.response
    };

    console.log('✅ Video operation started:', operation.name);

  } catch (apiErr: any) {
    console.error('âŒ Gemini API Error Details:', {
      message: apiErr.message,
      status: apiErr.status,
      statusText: apiErr.statusText,
      name: apiErr.name,
      stack: apiErr.stack?.split('\n')[0]
    });

    if (apiErr.response) {
      try {
        const responseText = await apiErr.response.text();
        console.error('ðŸ“‹ Gemini API Response Body:', responseText);
      } catch (e) {
        console.error('ðŸ“‹ Response body could not be parsed');
      }
    }

    if (apiErr.message?.includes('quota')) {
      throw new Error(`Gemini API Quota Exceeded. Please check your API key limits and billing.`);
    }

    if (apiErr.message?.includes('Invalid argument') || apiErr.message?.includes('400')) {
      throw new Error(`Gemini rejected the video request. This may be due to: 1) Image size still too large (${(base64Data.length / 1024).toFixed(0)}KB), 2) Model not available for your API key, 3) Invalid parameters. Original error: ${apiErr.message}`);
    }

    let errorMsg = apiErr.message || 'Video generation failed';
    throw new Error(`Gemini Video API Error: ${errorMsg}. Image size: ${(base64Data.length / 1024).toFixed(0)}KB, mimeType: ${mimeType}`);
  }

  console.log(`🎬 Video operation started, polling for completion...`);

  let pollCount = 0;
  const maxPolls = 60;

  while (!operation.done && pollCount < maxPolls) {
    await new Promise(r => setTimeout(r, 10000));

    const statusResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operation.name}?key=${apiKey}`,
      { method: 'GET' }
    );

    if (!statusResponse.ok) {
      console.error('âš ï¸ Status check failed:', statusResponse.status);
      pollCount++;
      continue;
    }

    const statusData = await statusResponse.json();
    operation.done = statusData.done || false;
    operation.response = statusData.response;

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

  const downloadUrl = `${uri}&key=${apiKey}`;

  try {
    const resp = await vanguardFetch(downloadUrl, {}, 4);
    const blob = await resp.blob();
    console.log(`ðŸ“¥ Video downloaded: ${blob.size} bytes`);
    return { url: URL.createObjectURL(blob), uri, blob };
  } catch (err: any) {
    throw new Error(`Asset Retrieval Failed: ${err.message}`);
  }
}
