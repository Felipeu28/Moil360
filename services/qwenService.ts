// ============================================================================
// QWEN SERVICE - Image & Video Generation via Qwen API
// ============================================================================
// FILE: services/qwenService.ts
// UPDATED: Now uses Vercel serverless proxy to bypass CORS
// ============================================================================

/**
 * Qwen Image & Video Generation Service
 * Routes through Vercel serverless proxy to avoid CORS restrictions
 */

// Determine proxy URL based on environment
const getProxyUrl = () => {
  if (typeof window === 'undefined') return '/api'; // SSR
  return window.location.origin + '/api'; // Browser
};

/**
 * Generate image using Qwen VL API via Vercel proxy
 */
export async function generateQwenImage(
  prompt: string,
  aspectRatio: '9:16' | '16:9' | '1:1' = '9:16'
): Promise<string> {
  console.log('🎨 Qwen Image Generation (via Vercel proxy):', { 
    prompt: prompt.substring(0, 50), 
    aspectRatio 
  });
  
  // Map aspect ratios to Qwen sizes
  const sizeMap = {
    '9:16': '1024x1792',   // Portrait
    '16:9': '1792x1024',   // Landscape
    '1:1': '1024x1024'     // Square
  };

  const size = sizeMap[aspectRatio];

  try {
    // Step 1: Start generation via proxy
    const proxyUrl = getProxyUrl();
    const initResponse = await fetch(`${proxyUrl}/qwen-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
        body: {
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
        }
      })
    });

    if (!initResponse.ok) {
      const errorData = await initResponse.json();
      throw new Error(`Qwen Proxy Error ${initResponse.status}: ${errorData.error || 'Unknown'}`);
    }

    const initData = await initResponse.json();
    const taskId = initData.output?.task_id;
    
    if (!taskId) {
      throw new Error('No task ID returned from Qwen API');
    }

    console.log('⏳ Qwen image task started:', taskId);

    // Step 2: Poll for completion via status proxy
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(
        `${proxyUrl}/qwen-status?taskId=${taskId}`,
        { method: 'GET' }
      );

      if (!statusResponse.ok) {
        console.warn(`⚠️ Status check failed (attempt ${attempts + 1})`);
        attempts++;
        continue;
      }

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
 * Generate video using Qwen CogVideoX API via Vercel proxy
 */
export async function generateQwenVideo(
  imageBase64: string,
  prompt: string
): Promise<{ url: string, blob: Blob }> {
  console.log('🎬 Qwen Video Generation (via Vercel proxy):', { 
    prompt: prompt.substring(0, 50) 
  });
  
  try {
    const proxyUrl = getProxyUrl();
    
    // Step 1: Start video generation
    const initResponse = await fetch(`${proxyUrl}/qwen-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/generation',
        body: {
          model: 'video-generation',
          input: {
            image_url: imageBase64, // May need adjustment based on actual API
            prompt: prompt
          },
          parameters: {
            duration: 6, // seconds
            fps: 30
          }
        }
      })
    });

    if (!initResponse.ok) {
      const errorData = await initResponse.json();
      throw new Error(`Qwen Video Proxy Error ${initResponse.status}: ${errorData.error || 'Unknown'}`);
    }

    const initData = await initResponse.json();
    const taskId = initData.output?.task_id;
    
    if (!taskId) {
      throw new Error('No task ID returned from Qwen Video API');
    }

    console.log('⏳ Qwen video task started:', taskId);

    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max for video
    
    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(
        `${proxyUrl}/qwen-status?taskId=${taskId}`,
        { method: 'GET' }
      );

      if (!statusResponse.ok) {
        console.warn(`⚠️ Video status check failed (attempt ${attempts + 1})`);
        attempts++;
        continue;
      }

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
