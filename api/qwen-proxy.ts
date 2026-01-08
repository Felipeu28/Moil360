// ============================================================================
// VERCEL SERVERLESS FUNCTION - Qwen API Proxy
// ============================================================================
// FILE: api/qwen-proxy.ts
// PURPOSE: Proxy DashScope API calls to bypass CORS restrictions
// ============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS headers for allowing frontend access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { endpoint, body, apiKey } = req.body;

    // Validate required fields
    if (!endpoint || !body) {
      return res.status(400).json({ 
        error: 'Missing required fields: endpoint, body' 
      });
    }

    // Use API key from environment or request
    const QWEN_API_KEY = apiKey || process.env.QWEN_API_KEY || process.env.VITE_QWEN_API_KEY;
    
    if (!QWEN_API_KEY) {
      return res.status(401).json({ 
        error: 'QWEN_API_KEY not configured in Vercel environment variables' 
      });
    }

    console.log(`🔀 Proxying request to: ${endpoint}`);

    // Forward request to DashScope API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ DashScope API Error:', data);
      return res.status(response.status).json({ 
        error: 'DashScope API error', 
        details: data 
      });
    }

    console.log('✅ DashScope request successful');
    
    // Return the response with CORS headers
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('❌ Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Proxy server error', 
      message: error.message 
    });
  }
}

// Export config for Vercel
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow larger payloads for image data
    },
  },
};
