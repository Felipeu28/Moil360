import React, { useState } from 'react';
import { supabase, testSupabaseConnection } from '../services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Layers, Mail, Lock, ArrowRight, UserPlus, RefreshCw, Construction, Zap } from 'lucide-react';

interface Props {
  onAuthSuccess: (session: Session) => void;
  onIsolatedMode: () => void;
}

export const AuthGate: React.FC<Props> = ({ onAuthSuccess, onIsolatedMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocalBypass = () => {
    localStorage.setItem('moil_storage_mode', 'local');
    onIsolatedMode();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // We no longer block the login button with testSupabaseConnection check.
      // We just try the login. If it's a server error (522/544), we handle it below.
      const { data, error: authError } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      
      if (authError) throw authError;
      
      if (data.session) {
        onAuthSuccess(data.session);
      } else if (!isLogin) {
        setError("Account registration complete. Please check email to verify.");
      }
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes('522') || msg.includes('544') || msg.includes('fetch') || msg.includes('429')) {
        setError("Vault gateway timeout (522). The database is currently saturated or waking up. Please use Isolated Mode to continue.");
      } else if (msg.includes('Invalid login')) {
        setError("Access denied. Incorrect email or vault key.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15),transparent_50%)]" />
      
      <div className="max-w-md w-full glass-card rounded-[3rem] p-10 shadow-2xl space-y-8 relative z-10 border border-white/10">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl mx-auto flex items-center justify-center rotate-3 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
            <Layers className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Content360</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Neural Strategy SaaS</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-[9px] font-black text-rose-400 uppercase tracking-widest text-center flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                required type="email" placeholder="IDENTITY EMAIL" 
                className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500/50 outline-none transition-all font-bold text-white uppercase tracking-widest text-xs"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                required type="password" placeholder="VAULT PASSWORD" 
                className="w-full pl-14 pr-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500/50 outline-none transition-all font-bold text-white uppercase tracking-widest text-xs"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all btn-glow active:scale-[0.98] disabled:opacity-30 ${isLogin ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (isLogin ? <><UserCheck className="w-4 h-4" /> Authenticate</> : <><UserPlus className="w-4 h-4" /> Create Profile</>)}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-4">
          <div className="flex flex-col gap-3 items-center w-full">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-[0.2em] transition-colors">
              {isLogin ? "Generate New Profile" : "Existing Identity? Log In"}
            </button>
            <div className="h-4" />
            <button 
              onClick={handleLocalBypass} 
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[9px] font-black text-slate-400 hover:text-indigo-400 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" /> Launch Isolated Mode (Local Cache)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShieldAlert = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const UserCheck = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);
