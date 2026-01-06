
import React, { useState } from 'react';
import { X, LogOut, Download, Database, ShieldCheck, History, ImageIcon, Film, Palette, Target, FileDown, UploadCloud, Archive, Calendar as CalendarIcon, ArrowRight, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { StrategyResult, BrandDNA, Language } from '../types';
import { translations } from '../services/i18nService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectKey: string;
  onSignOut: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFinalize: () => void;
  strategy: StrategyResult | null;
  archive: StrategyResult[];
  onSwitchMonth: (strategy: StrategyResult) => void;
  assetSummary?: { images: number, videos: number };
  brandDNA?: BrandDNA;
  onUpdateBrand: (dna: BrandDNA) => void;
  lang: Language;
  isCloudEnabled?: boolean;
  isSyncing?: boolean;
}

export const ProjectPortal: React.FC<Props> = ({ 
  isOpen, onClose, projectKey, onSignOut, onExport, onImport, onFinalize, strategy, archive, onSwitchMonth, assetSummary, brandDNA, onUpdateBrand, lang, isCloudEnabled, isSyncing
}) => {
  const t = translations[lang];
  const [localDNA, setLocalDNA] = useState<BrandDNA>(brandDNA || {
    logoDescription: '',
    primaryColor: '#6366F1',
    secondaryColor: '#FACC15',
    negativeKeywords: [],
    toneVoice: 'Aggressive, White Space, Punchy'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div className="w-full max-w-md h-full bg-white shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-xl"><Database className="w-6 h-6 text-white" /></div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{t.portal_title}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.workspace_intel}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-hide">
          <section className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 relative overflow-hidden">
            {isCloudEnabled && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </div>
            )}
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-indigo-600" /> {t.active_session}</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-white rounded-2xl border border-indigo-50 shadow-sm">
                <ImageIcon className="w-4 h-4 text-indigo-400 mb-1" />
                <span className="text-[10px] font-black text-slate-900 block">{assetSummary?.images || 0} {t.images}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-rose-50 shadow-sm">
                <Film className="w-4 h-4 text-rose-400 mb-1" />
                <span className="text-[10px] font-black text-slate-900 block">{assetSummary?.videos || 0} {t.premium}</span>
              </div>
            </div>
            {strategy && (
              <button onClick={() => { if(window.confirm(t.confirm_archive)) onFinalize(); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all">
                <Archive className="w-4 h-4 text-emerald-400" /> {t.finalize_btn}
              </button>
            )}
          </section>

          <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> {t.brand_dna}</h3>
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-5">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-400">{t.logo_intel}</label>
                   <textarea value={localDNA.logoDescription} onChange={e => setLocalDNA({...localDNA, logoDescription: e.target.value})} placeholder={t.logo_placeholder} className="w-full p-3 text-xs font-bold rounded-xl border-none h-16 bg-white shadow-inner resize-none outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div className="flex gap-4">
                   <div className="flex-1 space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400">{t.primary_color}</label>
                      <input type="color" value={localDNA.primaryColor} onChange={e => setLocalDNA({...localDNA, primaryColor: e.target.value})} className="w-full h-10 rounded-lg cursor-pointer border-none p-0" />
                   </div>
                   <div className="flex-1 space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400">{t.tone_profile}</label>
                      <input value={localDNA.toneVoice} onChange={e => setLocalDNA({...localDNA, toneVoice: e.target.value})} className="w-full h-10 px-3 text-[10px] font-bold rounded-lg bg-white border-none shadow-inner outline-none focus:ring-1 focus:ring-indigo-500" />
                   </div>
                </div>
                <button onClick={() => { onUpdateBrand(localDNA); alert('Identity updated.'); }} className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">{t.update_identity}</button>
             </div>
          </section>

          <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileDown className="w-3.5 h-3.5" /> {t.data_mgmt}</h3>
             <div className="grid grid-cols-1 gap-3">
                <button onClick={onExport} className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all group">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-indigo-600">{t.export_btn}</span>
                   <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </button>
                <label className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all group cursor-pointer">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-emerald-600">{t.import_btn}</span>
                   <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                   <input type="file" accept=".moil" className="hidden" onChange={onImport} />
                </label>
             </div>
          </section>

          {archive.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><History className="w-3.5 h-3.5 text-indigo-500" /> {t.past_strategies}</h3>
              <div className="space-y-3">
                {archive.map((archived, idx) => (
                  <button key={idx} onClick={() => onSwitchMonth(archived)} className="w-full bg-white border border-slate-100 p-5 rounded-[1.5rem] flex items-center justify-between hover:border-indigo-600 hover:shadow-xl group transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-indigo-50 transition-colors">
                        <CalendarIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter block">{archived.monthId}</span>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">{t.archived_on} {new Date(archived.archivedAt || '').toLocaleDateString()}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100">
           <button onClick={onSignOut} className="w-full bg-slate-50 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-rose-50 hover:text-rose-600 transition-all">
            <LogOut className="w-4 h-4" /> {t.sign_out}
          </button>
        </div>
      </div>
    </div>
  );
};
