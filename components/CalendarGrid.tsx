
import React from 'react';
import { ContentDay, GeneratedImage, GeneratedVideo, Language } from '../types';
import { translations } from '../services/i18nService';
import { Clock, Video, CheckCircle2, Film, Zap } from 'lucide-react';

interface Props {
  calendar: ContentDay[];
  generatedImages: GeneratedImage[];
  generatedVideos: GeneratedVideo[];
  onSelectDay: (day: ContentDay) => void;
  selectedDay?: ContentDay;
  lang: Language;
}

export const CalendarGrid: React.FC<Props> = ({ calendar, generatedImages, generatedVideos, onSelectDay, selectedDay, lang }) => {
  const t = translations[lang];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Educational': return 'bg-emerald-500';
      case 'Promotional': return 'bg-rose-500';
      case 'Engagement': return 'bg-sky-500';
      case 'Behind the Scenes': return 'bg-indigo-500';
      case 'Testimonial': return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  const hasImageForDay = (dayIndex: number) => generatedImages.some(img => img.dayIndex === dayIndex);
  const hasVideoForDay = (dayIndex: number) => generatedVideos.some(v => v.dayIndex === dayIndex);

  const handleDayClick = (item: ContentDay) => {
    onSelectDay(item);
    setTimeout(() => {
      const detailSection = document.getElementById('day-detail');
      if (detailSection) {
        detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-ES', { day: 'numeric' }),
      month: d.toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-ES', { month: 'short' }),
      weekday: d.toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-ES', { weekday: 'short' })
    };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-6">
      {calendar.map((item, idx) => {
        const hasAsset = hasImageForDay(item.day);
        const hasVideo = hasVideoForDay(item.day);
        const isSelected = selectedDay?.day === item.day;
        const dateParts = formatDate(item.date);

        return (
          <button
            key={item.day}
            onClick={() => handleDayClick(item)}
            className={`relative p-6 rounded-[2rem] border-2 text-left transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] h-56 flex flex-col justify-between group overflow-hidden
              ${isSelected ? 'border-indigo-600 bg-white ring-8 ring-indigo-50 shadow-2xl scale-[1.03] z-10' : 
                hasAsset ? 'border-slate-100 bg-white' : 'border-white bg-white hover:border-indigo-100 shadow-sm'}
              ${item.requires_video ? 'border-rose-100/50' : ''}
            `}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${getTypeColor(item.content_type)} opacity-80`} />
            
            {item.requires_video && !hasVideo && (
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                 <Zap className="w-8 h-8 text-rose-500 fill-rose-500" />
              </div>
            )}

            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter">
                  {dateParts.day}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  {dateParts.month}
                </span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                {hasVideo ? (
                  <div className="bg-rose-500 p-1 rounded-full shadow-lg animate-in zoom-in duration-300 ring-2 ring-white">
                    <Film className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : hasAsset ? (
                  <div className="bg-indigo-600 p-1 rounded-full shadow-lg animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : null}
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                  {dateParts.weekday}
                </span>
              </div>
            </div>
            
            <div className="flex-1 mt-4 overflow-hidden relative z-10">
              <p className={`text-[11px] font-bold leading-relaxed group-hover:text-indigo-600 transition-colors line-clamp-3
                ${hasAsset ? 'text-indigo-900/70' : 'text-slate-800'}`}>
                {item.topic}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <Clock className="w-3 h-3" /> {item.best_time}
              </div>
              <div className="flex items-center gap-2">
                {item.requires_video && (
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4 text-rose-500 fill-rose-500/10" />
                    <span className="text-[7px] font-black text-rose-500 uppercase tracking-tighter">PRO</span>
                  </div>
                )}
                <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">D{item.day}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
