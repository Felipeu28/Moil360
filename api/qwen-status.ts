// ============================================================================
// VERCEL SERVERLESS FUNCTION - Qwen Task Status Polling
// ============================================================================
// FILE: api/qwen-status.ts
// PURPOSE: Check status of async DashScope tasks
// ============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { taskId } = req.query;

    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({ error: 'Missing taskId parameter' });
    }

    const QWEN_API_KEY = process.env.QWEN_API_KEY || process.env.VITE_QWEN_API_KEY;
    
    if (!QWEN_API_KEY) {
      return res.status(401).json({ 
        error: 'QWEN_API_KEY not configured' 
      });
    }

    console.log(`🔍 Checking task status: ${taskId}`);

    // Check task status
    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Status Check Error:', data);
      return res.status(response.status).json({ 
        error: 'Status check failed', 
        details: data 
      });
    }

    console.log(`✅ Task ${taskId} status: ${data.output?.task_status || 'UNKNOWN'}`);
    
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('❌ Status Check Error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
}
