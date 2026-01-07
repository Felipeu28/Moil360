// ============================================================================
// QWEN SERVICE - Image & Video Generation via Qwen API
// ============================================================================
// FILE: services/qwenService.ts (NEW FILE)
// ============================================================================

/**
 * Qwen Image & Video Generation Service
 * Provides backup AI engines for image and video generation
 */

interface QwenImageRequest {
  model: string;
  prompt: string;
  size: string;
  n: number;
}

interface QwenImageResponse {
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
}

/**
 * Generate image using Qwen VL API
 */
export async function generateQwenImage(
  prompt: string,
  aspectRatio: '9:16' | '16:9' | '1:1' = '9:16'
): Promise<string> {
  console.log('🎨 Qwen Image Generation:', { prompt: prompt.substring(0, 50), aspectRatio });
  
  const apiKey = import.meta.env.VITE_QWEN_API_KEY || (process as any).env.VITE_QWEN_API_KEY;
  
  if (!apiKey) {
    throw new Error('QWEN_API_KEY not configured. Please add VITE_QWEN_API_KEY to Vercel environment variables.');
  }

  // Map aspect ratios to Qwen sizes
  const sizeMap = {
    '9:16': '1024x1792',   // Portrait
    '16:9': '1792x1024',   // Landscape
    '1:1': '1024x1024'     // Square
  };

  const size = sizeMap[aspectRatio];

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: {
          prompt: prompt,
          negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy'
        },
        parameters: {
          size: size,
          n: 1,
          seed: Math.floor(Math.random() * 1000000)
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Qwen API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Qwen uses async generation, need to poll for result
    const taskId = data.output?.task_id;
    if (!taskId) {
      throw new Error('No task ID returned from Qwen API');
    }

    console.log('⏳ Qwen task started:', taskId);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const statusData = await statusResponse.json();
      
      if (statusData.output?.task_status === 'SUCCEEDED') {
        const imageUrl = statusData.output?.results?.[0]?.url;
        if (!imageUrl) {
          throw new Error('No image URL in successful response');
        }
        
        console.log('✅ Qwen image generated:', imageUrl);
        
        // Fetch image and convert to base64 for consistency with Gemini
        const imgResponse = await fetch(imageUrl);
        const blob = await imgResponse.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        
        return base64;
      }
      
      if (statusData.output?.task_status === 'FAILED') {
        throw new Error(`Qwen generation failed: ${statusData.output?.message || 'Unknown error'}`);
      }
      
      attempts++;
    }
    
    throw new Error('Qwen image generation timeout after 5 minutes');
    
  } catch (err: any) {
    console.error('❌ Qwen Image Error:', err);
    throw new Error(`Qwen Image Generation Failed: ${err.message}`);
  }
}

/**
 * Generate video using Qwen multimodal API
 * Note: Qwen's video API is different from Gemini - this is a placeholder
 */
export async function generateQwenVideo(
  imageBase64: string,
  prompt: string
): Promise<{ url: string, blob: Blob }> {
  console.log('🎬 Qwen Video Generation:', { prompt: prompt.substring(0, 50) });
  
  const apiKey = import.meta.env.VITE_QWEN_API_KEY || (process as any).env.VITE_QWEN_API_KEY;
  
  if (!apiKey) {
    throw new Error('QWEN_API_KEY not configured. Please add VITE_QWEN_API_KEY to Vercel environment variables.');
  }

  try {
    // Note: Qwen video generation API endpoint
    // This is a simplified version - adjust based on actual Qwen video API
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify({
        model: 'video-generation',
        input: {
          image_url: imageBase64, // May need to upload to Qwen storage first
          prompt: prompt
        },
        parameters: {
          duration: 6, // seconds
          fps: 30
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Qwen Video API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const taskId = data.output?.task_id;
    
    if (!taskId) {
      throw new Error('No task ID returned from Qwen Video API');
    }

    console.log('⏳ Qwen video task started:', taskId);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max for video
    
    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const statusData = await statusResponse.json();
      
      if (statusData.output?.task_status === 'SUCCEEDED') {
        const videoUrl = statusData.output?.results?.[0]?.url;
        if (!videoUrl) {
          throw new Error('No video URL in successful response');
        }
        
        console.log('✅ Qwen video generated:', videoUrl);
        
        // Fetch video blob
        const videoResponse = await fetch(videoUrl);
        const blob = await videoResponse.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        return { url: objectUrl, blob };
      }
      
      if (statusData.output?.task_status === 'FAILED') {
        throw new Error(`Qwen video generation failed: ${statusData.output?.message || 'Unknown error'}`);
      }
      
      attempts++;
    }
    
    throw new Error('Qwen video generation timeout after 10 minutes');
    
  } catch (err: any) {
    console.error('❌ Qwen Video Error:', err);
    throw new Error(`Qwen Video Generation Failed: ${err.message}`);
  }
}
