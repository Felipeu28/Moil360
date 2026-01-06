
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fumgwlletjdsmiqbirou.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bWd3bGxldGpkc21pcWJpcm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDgzNDMsImV4cCI6MjA4MjA4NDM0M30.2lDJapxfl_oYGE7QH-zGTVjwdTsOO7FBpeehhb2Y098'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true, // Enabled for session continuity and request reduction
    detectSessionInUrl: true,
    storageKey: 'moil-vanguard-auth-v4'
  },
  global: {
    headers: {
      'X-Client-Info': 'moil-content360/1.0.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// ✅ VANGUARD WARM-UP: Reduces initial preflight latency by establishing connection pool early.
if (typeof window !== 'undefined' && navigator.onLine) {
  // Check if we are not in isolated mode before warming up
  if (localStorage.getItem('moil_storage_mode') !== 'local') {
    // Fix: Use the second argument of then for error handling since PostgrestBuilder returns a PromiseLike which may lack a .catch method in some environments
    supabase.from('projects').select('count', { head: true, count: 'exact' }).limit(0).then(
      () => {
        console.debug("Vanguard Intelligence Node: Connection pool warmed.");
      },
      () => {
        // Silently fail to avoid console noise for unauthenticated users
      }
    );
  }
}

let lastCheckResult: { ok: boolean; status?: number; error: string | null } = { ok: true, error: null };
let lastCheckTime = 0;
const MIN_MANUAL_INTERVAL = 30000; // 30 seconds

export const testSupabaseConnection = async (force = false): Promise<{ ok: boolean; status?: number; error: string | null }> => {
  const now = Date.now();
  
  if (!force && (now - lastCheckTime < MIN_MANUAL_INTERVAL)) {
    return lastCheckResult;
  }

  const breaker = localStorage.getItem('moil_vault_breaker');
  if (breaker && now < parseInt(breaker)) {
    return { ok: false, error: "VAULT_COOLING" };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { ok: false, error: "OFFLINE" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); 

  try {
    const resp = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    lastCheckTime = Date.now();
    
    if (resp.status >= 500 || resp.status === 429) {
      // Trip breaker for 2 minutes (120000ms) - shorter than before to prevent long lockouts
      localStorage.setItem('moil_vault_breaker', (Date.now() + 120000).toString());
      window.dispatchEvent(new CustomEvent('vanguard-circuit-tripped'));
      lastCheckResult = { ok: false, status: resp.status, error: "VAULT_SATURATED" };
      return lastCheckResult;
    }

    lastCheckResult = { 
      ok: resp.status >= 200 && resp.status < 500, 
      status: resp.status,
      error: null
    };
    return lastCheckResult;
  } catch (e: any) {
    clearTimeout(timeoutId);
    // Timeout or fetch error is a sign of saturation
    localStorage.setItem('moil_vault_breaker', (Date.now() + 120000).toString());
    window.dispatchEvent(new CustomEvent('vanguard-circuit-tripped'));
    lastCheckResult = { ok: false, error: "VAULT_TIMEOUT" };
    return lastCheckResult; 
  }
};
