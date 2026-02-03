
import React, { useState, useRef } from 'react';
import { BusinessInfo, BrandDNA, Language, StrategicMission, VisualSignature } from '../types';
import { translations } from '../services/i18nService';
import { Rocket, Users, Zap, Briefcase, FileText, Calendar, History, Sparkles, Globe, Link2, Terminal, UploadCloud, FileJson, Target, Palette } from 'lucide-react';

interface Props {
  onStart: (info: BusinessInfo) => void;
  onRemoteSync: (url: string) => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  suggestedStartDate?: string;
  existingHistory?: string;
  existingBrand?: BrandDNA;
  lang: Language;
}

export const BusinessForm: React.FC<Props> = ({ onStart, onRemoteSync, onImport, isLoading, suggestedStartDate, existingHistory, existingBrand, lang }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'remote' | 'import'>('local');
  const [webhookUrl, setWebhookUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [info, setInfo] = useState<BusinessInfo>({
    name: '',
    industry: '',
    targetAudience: '',
    coreValues: '',
    mainGoals: '',
    existingResearch: '',
    startDate: suggestedStartDate || new Date().toISOString().split('T')[0],
    previousContent: existingHistory || '',
    brandDNA: existingBrand
  });

  const t = translations[lang] || translations['EN'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(info);
  };

  const handleRemoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (webhookUrl.trim()) onRemoteSync(webhookUrl.trim());
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 transition-all">
      <div className="bg-slate-900 p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-600/20">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">{t.launchpad_title}</h1>
            </div>
            <p className="text-indigo-200/60 font-medium text-sm max-w-md uppercase tracking-[0.2em]">{t.launchpad_subtitle}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 bg-white/5 p-2 rounded-2xl w-fit relative z-10 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'local' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Zap className="w-3.5 h-3.5 inline mr-2 fill-current" /> Local Vanguard AI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('remote')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'remote' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Link2 className="w-3.5 h-3.5 inline mr-2" /> External Node
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'import' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <FileJson className="w-3.5 h-3.5 inline mr-2" /> Resume Archive
          </button>
        </div>
      </div>

      {activeTab === 'local' && (
        <form onSubmit={handleSubmit} className="p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-2">
                <Briefcase className="w-4 h-4 text-indigo-500" /> {t.identity_label}
              </label>
              <input required className="w-full px-8 py-5 border-2 border-slate-50 rounded-3xl focus:ring-8 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold text-slate-900 text-lg shadow-inner" placeholder={t.business_name} value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-2">
                <Calendar className="w-4 h-4 text-emerald-500" /> {t.op_start}
              </label>
              <input required type="date" className="w-full px-8 py-5 border-2 border-slate-50 rounded-3xl focus:ring-8 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all bg-slate-50 font-bold text-slate-900 text-lg shadow-inner" value={info.startDate} onChange={e => setInfo({ ...info, startDate: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-2">
                <Globe className="w-4 h-4 text-amber-500" /> {t.market_sector}
              </label>
              <input required className="w-full px-8 py-5 border-2 border-slate-50 rounded-3xl focus:ring-8 focus:ring-amber-50 focus:border-amber-500 outline-none transition-all bg-slate-50 font-bold text-slate-900 text-lg shadow-inner" placeholder={t.market_sector_placeholder} value={info.industry} onChange={e => setInfo({ ...info, industry: e.target.value })} />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-2">
                <Users className="w-4 h-4 text-rose-500" /> {t.target_demographic}
              </label>
              <input required className="w-full px-8 py-5 border-2 border-slate-50 rounded-3xl focus:ring-8 focus:ring-rose-50 focus:border-rose-500 outline-none transition-all bg-slate-50 font-bold text-slate-900 text-lg shadow-inner" placeholder={t.target_demo_placeholder} value={info.targetAudience} onChange={e => setInfo({ ...info, targetAudience: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-2">
                <Target className="w-4 h-4 text-indigo-500" /> {t.strategic_mission}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['Growth', 'Sales', 'Authority', 'Community'] as StrategicMission[]).map(mission => (
                  <button
                    key={mission}
                    type="button"
                    onClick={() => setInfo({ ...info, strategicMission: mission })}
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${info.strategicMission === mission ? 'border-indigo-500 bg-indigo-50 shadow-lg text-indigo-900' : 'border-slate-50 bg-slate-50 hover:border-slate-200 text-slate-900'}`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest">{t[`mission_${mission.toLowerCase()}` as keyof typeof t]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-2">
                <Palette className="w-4 h-4 text-rose-500" /> {t.visual_signature}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['Minimalist', 'Bold', 'Corporate', 'Neon', 'Organic'] as VisualSignature[]).map(sig => (
                  <button
                    key={sig}
                    type="button"
                    onClick={() => setInfo({ ...info, visualSignature: sig })}
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${info.visualSignature === sig ? 'border-rose-500 bg-rose-50 shadow-lg text-rose-900' : 'border-slate-50 bg-slate-50 hover:border-slate-200 text-slate-900'}`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest">{t[`sig_${sig.toLowerCase()}` as keyof typeof t]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> {t.monthly_guidance}
            </label>
            <textarea className="w-full px-8 py-6 border-2 border-slate-50 rounded-[2.5rem] focus:ring-8 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all bg-slate-50 h-32 text-sm font-medium leading-relaxed shadow-inner" placeholder={t.monthly_guidance_placeholder} value={info.monthlyGuidance || ''} onChange={e => setInfo({ ...info, monthlyGuidance: e.target.value })} />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-2">
              <History className="w-4 h-4 text-violet-500" /> {t.prev_context}
            </label>
            <textarea className="w-full px-8 py-6 border-2 border-slate-50 rounded-[2.5rem] focus:ring-8 focus:ring-violet-50 focus:border-violet-500 outline-none transition-all bg-slate-50 h-32 text-sm font-medium leading-relaxed shadow-inner" placeholder={t.prev_context_placeholder} value={info.previousContent} onChange={e => setInfo({ ...info, previousContent: e.target.value })} />
          </div>

          <div className="pt-6">
            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-6 text-2xl uppercase tracking-[0.2em] group relative overflow-hidden">
              {isLoading ? (
                <><div className="w-8 h-8 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin"></div> {t.arch_in_progress}</>
              ) : (
                <><Sparkles className="w-8 h-8 group-hover:scale-125 transition-transform" /> {t.assemble_blueprint}</>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'remote' && (
        <div className="p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 flex items-center gap-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
              <Terminal className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900">Remote Node Sync</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Fetch intelligence directly from N8N workflows or remote JSON nodes.</p>
            </div>
          </div>

          <form onSubmit={handleRemoteSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-2">
                <Link2 className="w-4 h-4 text-indigo-500" /> N8N Webhook / JSON URL
              </label>
              <input
                required
                type="url"
                className="w-full px-8 py-6 border-2 border-slate-50 rounded-3xl focus:ring-8 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all bg-slate-50 font-bold text-slate-900 text-lg shadow-inner"
                placeholder="https://n8n.yourdomain.com/webhook/..."
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
              />
            </div>

            <div className="pt-6">
              <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-6 text-2xl uppercase tracking-[0.2em] group relative overflow-hidden">
                {isLoading ? (
                  <><div className="w-8 h-8 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin"></div> {t.arch_in_progress}</>
                ) : (
                  <><Terminal className="w-8 h-8 group-hover:scale-125 transition-transform" /> Connect External Node</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-emerald-50 rounded-[2.5rem] p-10 border border-emerald-100 flex flex-col items-center text-center gap-8">
            <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-600/30">
              <UploadCloud className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-emerald-900">Restore Legacy Blueprint</h2>
              <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                Upload your .moil file to immediately restore your strategy, visuals, and brand data.
              </p>
            </div>

            <div className="w-full max-w-md">
              <label className="group w-full flex flex-col items-center justify-center p-12 border-4 border-dashed border-emerald-200 hover:border-emerald-500 bg-white rounded-[2.5rem] transition-all cursor-pointer">
                <div className="flex flex-col items-center gap-4 group-hover:scale-110 transition-transform">
                  <FileJson className="w-10 h-10 text-emerald-400 group-hover:text-emerald-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-600">{t.import_btn}</span>
                </div>
                <input type="file" ref={fileInputRef} accept=".moil" className="hidden" onChange={onImport} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
