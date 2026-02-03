import React from 'react';
import { StrategyResult, Language } from '../types';
import { translations } from '../services/i18nService';
import {
    TrendingUp,
    Calendar,
    Layers,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    BarChart3,
    Award,
    Target
} from 'lucide-react';

interface Props {
    strategy: StrategyResult;
    lang: Language;
    onKickoff: (guidance?: string) => void;
    onClose: () => void;
    assetSummary: { images: number; videos: number };
}

export const MonthOverView: React.FC<Props> = ({ strategy, lang, onKickoff, onClose, assetSummary }) => {
    const t = translations[lang] || translations['EN'];
    const [guidance, setGuidance] = React.useState('');
    const [sentiment, setSentiment] = React.useState<'good' | 'pivot' | 'double'>('good');
    const [mission, setMission] = React.useState(strategy.strategicMission || 'Growth');

    const metrics = [
        { label: 'Intelligence Depth', value: `${strategy.quality_score}%`, icon: TrendingUp, color: 'text-emerald-400' },
        { label: 'Asset Production', value: `${assetSummary.images + assetSummary.videos} items`, icon: Layers, color: 'text-indigo-400' },
        { label: 'Strategic Focus', value: strategy.context?.seasonalFocus || 'Standard', icon: Sparkles, color: 'text-amber-400' },
        { label: 'Market Grounding', value: `${strategy.insights?.length || 0} sources`, icon: BarChart3, color: 'text-sky-400' }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="max-w-4xl w-full bg-[#020617] p-12 rounded-[4rem] border border-white/10 shadow-[0_80px_160px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col gap-12">

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Campaign Post-Mortem</span>
                        </div>
                        <div className="h-[1px] flex-1 bg-white/5" />
                    </div>
                    <h2 className="text-6xl font-black tracking-tighter uppercase leading-tight">
                        Month {strategy.monthId || 'Complete'} <span className="text-indigo-500">Finalized.</span>
                    </h2>
                    <p className="text-lg font-medium text-slate-400 max-w-2xl">
                        Intelligence successfully archived. Your brand has reached a maturity score of <span className="text-white font-bold">{strategy.quality_score}%</span> this cycle.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {metrics.map((m, i) => (
                        <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4 group hover:bg-white/10 transition-all">
                            <m.icon className={`w-6 h-6 ${m.color}`} />
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.label}</div>
                                <div className="text-2xl font-black text-white">{m.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                        <div className="flex items-center gap-4">
                            <Layers className="w-5 h-5 text-indigo-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.sentiment_reflection}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {(['good', 'pivot', 'double'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSentiment(type)}
                                    className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2 ${sentiment === type ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/5 bg-white/5 text-slate-400'}`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t[`sentiment_${type}` as keyof typeof t]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                        <div className="flex items-center gap-4">
                            <Target className="w-5 h-5 text-rose-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.strategic_mission}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {(['Growth', 'Sales', 'Authority', 'Community'] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMission(m)}
                                    className={`p-3 rounded-2xl border-2 transition-all text-center ${mission === m ? 'border-rose-500 bg-rose-500/10 text-white' : 'border-white/5 bg-white/5 text-slate-400'}`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t[`mission_${m.toLowerCase()}` as keyof typeof t]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 relative group space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.monthly_guidance}</span>
                        </div>
                    </div>
                    <textarea
                        value={guidance}
                        onChange={(e) => setGuidance(e.target.value)}
                        placeholder={t.monthly_guidance_placeholder}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[120px] resize-none"
                    />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
                    <button
                        onClick={() => {
                            const combinedGuidance = `[SENTIMENT: ${sentiment.toUpperCase()}] [MISSION: ${mission}] ${guidance}`;
                            onKickoff(combinedGuidance);
                        }}
                        className="flex-1 w-full bg-white text-slate-950 px-10 py-6 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group"
                    >
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Kickoff Next Month
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>

                    <button
                        onClick={onClose}
                        className="px-10 py-6 text-slate-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors"
                    >
                        Return to Hub
                    </button>
                </div>

                <div className="flex items-center justify-center gap-4 opacity-20 hover:opacity-100 transition-opacity">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-[0.4em]">Strategic Bridge Active</span>
                </div>

            </div>
        </div>
    );
};
