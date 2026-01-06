import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ContentDay, GeneratedImage, GeneratedVideo, OverlaySettings, BrandDNA, Language } from '../types';
import { generateAIImage, generateAIVideo, translateContent } from '../services/geminiService';
import { translations } from '../services/i18nService';
import { 
  Copy, ImageIcon, LayoutGrid, Sparkles, MessageSquare, RefreshCw, Check, Video, 
  Edit3, Save, X, ChevronRight, ChevronLeft, Download, Film, Zap, Maximize, Move, Bold, Globe, Layers, Target, Hash, Type as TypeIcon, AlignCenter, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Wand2, Palette, Sliders, AlertCircle, AlignLeft, AlignRight, Square, Box, Sun, Trash2, RotateCcw, Undo2, LayoutTemplate, Grid3X3
} from 'lucide-react';

interface Props {
  day: ContentDay;
  generatedImages: GeneratedImage[];
  generatedVideos: GeneratedVideo[];
  visualLayers: Record<string, OverlaySettings[]>;
  onUpdateLayers: (layers: Record<string, OverlaySettings[]>) => void;
  onImageGenerated: (img: GeneratedImage) => void;
  onVideoGenerated: (vid: GeneratedVideo) => void;
  onRegenerate: (day: ContentDay, feedback: string) => Promise<void>;
  onManualEdit: (day: ContentDay) => void;
  onDeleteAsset?: (url: string, type: 'image' | 'video') => void;
  brandDNA?: BrandDNA;
  lang: Language;
}

const FONTS = [
  { name: 'Impact', family: 'Anton' },
  { name: 'Bold Block', family: 'Bebas Neue' },
  { name: 'Modern', family: 'Montserrat' },
  { name: 'Clean', family: 'Plus Jakarta Sans' },
  { name: 'Personal', family: 'Caveat' }
];

const COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Viral Yellow', value: '#FACC15' },
  { name: 'Hot Red', value: '#EF4444' },
  { name: 'Neon Green', value: '#22C55E' },
  { name: 'Moil Indigo', value: '#6366F1' }
];

const VISUAL_MODES = [
  { id: 'none', name: 'Raw', class: '' },
  { id: 'noir', name: 'Noir', class: 'grayscale brightness-75 contrast-125' },
  { id: 'vintage', name: 'Vintage', class: 'sepia brightness-90 contrast-90 saturate-50' },
  { id: 'neon', name: 'Neon', class: 'hue-rotate-180 saturate-200 contrast-110' },
  { id: 'chrome', name: 'Chrome', class: 'contrast-150 brightness-110 saturate-150 hue-rotate-15' },
  { id: 'dream', name: 'Dream', class: 'blur-[0.5px] brightness-110 saturate-[0.8]' }
];

const GLASS_OPTIONS = [
  { id: 'none', label: 'None', icon: X },
  { id: 'glass-light', label: 'Ice Glass', icon: Box, class: 'bg-white/20 backdrop-blur-md border border-white/30' },
  { id: 'glass-dark', label: 'Smoked Glass', icon: Square, class: 'bg-black/40 backdrop-blur-md border border-white/10' },
  { id: 'glass-tint', label: 'Brand Tint', icon: Sun, class: 'bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30' }
];

const SNAP_POINTS_THIRDS = [33.33, 50, 66.66];
const SNAP_POINTS_GOLDEN = [38.2, 50, 61.8];
const SNAP_THRESHOLD = 3;

const getProportionalFontSize = (size: number, width: number) => {
  return (size / 400) * width;
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const paragraphs = (text || '').split('\n');
  const lines: string[] = [];

  paragraphs.forEach(paragraph => {
    const words = paragraph.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine.toUpperCase());
      const testWidth = metrics.width;

      if (testWidth > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  });
  
  return lines;
};

export const DayDetailView: React.FC<Props> = ({ 
  day, generatedImages, generatedVideos, visualLayers, onUpdateLayers, onImageGenerated, onVideoGenerated, onRegenerate, onManualEdit, onDeleteAsset, brandDNA, lang
}) => {
  const t = translations[lang];
  const [loadingImg, setLoadingImg] = useState<boolean>(false);
  const [loadingVid, setLoadingVid] = useState(false);
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const [imageEngine, setImageEngine] = useState<'gemini' | 'qwen'>('gemini');
  const [videoEngine, setVideoEngine] = useState<'gemini' | 'qwen'>('gemini');
  const [copied, setCopied] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  
  const [targetLang, setTargetLang] = useState<'English' | 'Spanish' | 'Other'>('English');
  const [customLang, setCustomLang] = useState('');
  
  const [showRewritePanel, setShowRewritePanel] = useState(false);
  const [rewriteFeedback, setRewriteFeedback] = useState('');
  
  const [showImgEditPanel, setShowImgEditPanel] = useState(false);
  const [imgEditFeedback, setImgEditFeedback] = useState('');
  
  const [motionSimulation, setMotionSimulation] = useState(false);
  const [showOverlayDesigner, setShowOverlayDesigner] = useState(false);
  const [gridMode, setGridMode] = useState<'none' | 'thirds' | 'golden'>('none');
  const [activeSnapLines, setActiveSnapLines] = useState<{x: number | null, y: number | null}>({ x: null, y: null });
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [draggingLayer, setDraggingLayer] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewWidth, setPreviewWidth] = useState(320);
  
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const currentDayImages = generatedImages.filter(img => img.dayIndex === day.day);
  const currentDayVideos = generatedVideos.filter(v => v.dayIndex === day.day);
  
  const galleryAssets = useMemo(() => [
    ...currentDayImages.map((img, i) => ({ 
      type: 'image' as const, 
      url: img.url, 
      label: `Draft v${i + 1} (${img.modelId === 'qwen' ? 'Qwen' : 'Gemini'})`,
      createdAt: img.createdAt,
      rawUrl: img.url 
    })), 
    ...currentDayVideos.map((vid, i) => ({ 
      type: 'video' as const, 
      url: vid.url, 
      label: `Render v${vid.version} (${vid.modelId === 'qwen' ? 'Qwen' : 'Gemini'})`, 
      createdAt: vid.createdAt,
      rawUrl: vid.url
    }))
  ].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)), [currentDayImages, currentDayVideos]);

  const [assetIndex, setAssetIndex] = useState(Math.max(0, galleryAssets.length - 1));
  
  // Safe indexing for day switching
  const activeAsset = galleryAssets[assetIndex] || galleryAssets[galleryAssets.length - 1];

  const getDefaultLayers = useCallback((): OverlaySettings[] => [
    { 
      text: day.hook, font: FONTS[0].family, color: COLORS[0].value, size: 25, isBold: true, pos: { x: 50, y: 35 }, 
      glassStyle: 'none', textAlign: 'center', hasShadow: true, shadowBlur: 15, strokeColor: '#000000', strokeWidth: 0
    },
    { 
      text: '', font: FONTS[2].family, color: COLORS[0].value, size: 20, isBold: false, pos: { x: 50, y: 65 }, 
      glassStyle: 'none', textAlign: 'center', hasShadow: true, shadowBlur: 10, strokeColor: '#000000', strokeWidth: 0
    }
  ], [day.hook]);

  const activeVisualSettings = useMemo(() => {
    if (!activeAsset) return { layers: getDefaultLayers(), visualMode: 'none' };
    const stored = visualLayers[activeAsset.url];
    if (stored && Array.isArray(stored)) {
      return { layers: stored, visualMode: (stored as any).visualMode || 'none' };
    }
    return { layers: getDefaultLayers(), visualMode: 'none' };
  }, [activeAsset, visualLayers, getDefaultLayers]);

  const currentLayers = activeVisualSettings.layers || [];
  const activeVisualMode = activeVisualSettings.visualMode || 'none';

  const saveVisualEdits = (layers: OverlaySettings[], mode: string) => {
    if (!activeAsset) return;
    setSaveStatus('saving');
    const finalData = [...layers];
    (finalData as any).visualMode = mode;
    onUpdateLayers({ ...visualLayers, [activeAsset.url]: finalData });
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');
    }, 1000);
  };

  const updateLayer = (index: number, updates: Partial<OverlaySettings>) => {
    if (!currentLayers[index]) return;
    const newLayers = [...currentLayers];
    newLayers[index] = { ...newLayers[index], ...updates };
    saveVisualEdits(newLayers, activeVisualMode);
  };

  const resetVisuals = () => {
    saveVisualEdits(getDefaultLayers(), 'none');
  };

  const setVisualFilter = (modeId: string) => {
    saveVisualEdits(currentLayers, modeId);
  };

  useEffect(() => {
    if (!previewRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) setPreviewWidth(entry.contentRect.width);
      }
    });
    observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, [showOverlayDesigner, activeAsset?.url]);

  useEffect(() => {
    if (galleryAssets.length > 0) {
      setAssetIndex(galleryAssets.length - 1);
    }
  }, [galleryAssets.length]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    if (!showOverlayDesigner) return;
    e.stopPropagation();
    setDraggingLayer(index);
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (draggingLayer === null || !previewRef.current || !activeAsset) return;
    const rect = previewRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    let x = Math.min(Math.max(5, ((clientX - rect.left) / rect.width) * 100), 95);
    let y = Math.min(Math.max(5, ((clientY - rect.top) / rect.height) * 100), 95);
    
    let snapX: number | null = null;
    let snapY: number | null = null;
    const points = gridMode === 'golden' ? SNAP_POINTS_GOLDEN : SNAP_POINTS_THIRDS;

    if (gridMode !== 'none') {
      points.forEach(p => {
        if (Math.abs(x - p) < SNAP_THRESHOLD) { x = p; snapX = p; }
        if (Math.abs(y - p) < SNAP_THRESHOLD) { y = p; snapY = p; }
      });
    }

    setActiveSnapLines({ x: snapX, y: snapY });
    updateLayer(draggingLayer, { pos: { x, y } });
  }, [draggingLayer, activeAsset, gridMode, updateLayer]);

  const handleDragEnd = useCallback(() => {
    setDraggingLayer(null);
    setActiveSnapLines({ x: null, y: null });
  }, []);

  useEffect(() => {
    if (draggingLayer !== null) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [draggingLayer, handleDragMove, handleDragEnd]);

  const handleDownload = async () => {
    if (!activeAsset || !currentLayers || currentLayers.length === 0) return;
    try {
      let finalUrl = activeAsset.rawUrl;
      if (activeAsset.type === 'image') {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve; img.onerror = reject; img.src = activeAsset.rawUrl;
        });
        
        const width = 1080; const height = 1920; 
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const filterObj = VISUAL_MODES.find(m => m.id === activeVisualMode);
        if (filterObj?.id === 'noir') ctx.filter = 'grayscale(1) brightness(0.75) contrast(1.25)';
        else if (filterObj?.id === 'vintage') ctx.filter = 'sepia(1) brightness(0.9) contrast(0.9) saturate(0.5)';
        else if (filterObj?.id === 'neon') ctx.filter = 'hue-rotate(180deg) saturate(2) contrast(1.1)';
        else if (filterObj?.id === 'chrome') ctx.filter = 'contrast(1.5) brightness(1.1) saturate(1.5) hue-rotate(15deg)';

        ctx.drawImage(img, 0, 0, width, height);
        ctx.filter = 'none';
        await document.fonts.ready;

        for (const layer of currentLayers) {
          if (!layer || !layer.text) continue;
          const fontSize = (layer.size / 400) * width;
          const fontString = `${layer.isBold ? '900' : '500'} ${fontSize}px "${layer.font}"`;
          await document.fonts.load(fontString);

          ctx.save();
          ctx.font = fontString;
          ctx.textAlign = 'center'; 
          ctx.textBaseline = 'middle';
          
          const maxWidth = width * 0.85; 
          const lines = wrapText(ctx, layer.text, maxWidth);
          const lineHeight = fontSize * 1.1; 
          const targetX = (layer.pos.x / 100) * width;
          const targetY = (layer.pos.y / 100) * height;
          const padX = fontSize * 0.45; const padY = fontSize * 0.25; const lineSpacing = fontSize * 0.15;

          if (layer.glassStyle && layer.glassStyle !== 'none') {
            ctx.save();
            if (layer.glassStyle === 'glass-light') ctx.fillStyle = 'rgba(255,255,255,0.25)';
            else if (layer.glassStyle === 'glass-dark') ctx.fillStyle = 'rgba(0,0,0,0.55)';
            else if (layer.glassStyle === 'glass-tint') ctx.fillStyle = 'rgba(79,70,229,0.35)';

            const totalBlockHeight = (lines.length * lineHeight) + ((lines.length - 1) * lineSpacing);
            lines.forEach((l, i) => {
              const metrics = ctx.measureText(l.trim().toUpperCase());
              const bgW = metrics.width + (padX * 2);
              const bgH = lineHeight + (padY * 2);
              const yOffsetFromCenter = (i * (lineHeight + lineSpacing)) - (totalBlockHeight / 2) + (lineHeight / 2);
              ctx.fillRect(targetX - bgW / 2, targetY + yOffsetFromCenter - bgH / 2, bgW, bgH);
              ctx.strokeStyle = 'rgba(255,255,255,0.15)';
              ctx.lineWidth = 2;
              ctx.strokeRect(targetX - bgW / 2, targetY + yOffsetFromCenter - bgH / 2, bgW, bgH);
            });
            ctx.restore();
          }

          const totalBlockHeightText = (lines.length * lineHeight) + ((lines.length - 1) * lineSpacing);
          lines.forEach((l, i) => {
            const yOffsetFromCenter = (i * (lineHeight + lineSpacing)) - (totalBlockHeightText / 2) + (lineHeight / 2);
            const textToDraw = l.trim().toUpperCase();
            ctx.save();
            if (layer.hasShadow) {
              ctx.shadowColor = 'rgba(0,0,0,0.85)';
              ctx.shadowBlur = ((layer.shadowBlur || 15) / 100) * fontSize;
              ctx.shadowOffsetY = 8;
            }
            if (layer.strokeWidth > 0) {
              ctx.strokeStyle = layer.strokeColor || '#000000';
              ctx.lineWidth = ((layer.strokeWidth || 0) / 100) * fontSize;
              ctx.lineJoin = 'round';
              ctx.strokeText(textToDraw, targetX, targetY + yOffsetFromCenter);
            }
            ctx.fillStyle = layer.color;
            ctx.fillText(textToDraw, targetX, targetY + yOffsetFromCenter);
            ctx.restore();
          });
          ctx.restore();
        }
        finalUrl = canvas.toDataURL('image/png', 1.0);
      }
      const link = document.createElement('a');
      link.href = finalUrl;
      link.download = `C360_Day${day.day}_V${assetIndex+1}.${activeAsset.type === 'image' ? 'png' : 'mp4'}`;
      link.click();
    } catch (err) { 
      console.error("Export Failed:", err);
      alert("Failed to compile final visual assets.");
    }
  };

  const handleTranslate = async () => {
    const langKey = targetLang === 'Other' ? customLang : targetLang;
    if (!langKey || loadingTranslate) return;
    setLoadingTranslate(true);
    try {
      const result = await translateContent(day.hook, day.full_caption, langKey);
      const updatedTranslations = { ...day.translations, [langKey]: { hook: result.hook, caption: result.caption } };
      onManualEdit({ ...day, hook: result.hook, full_caption: result.caption, translations: updatedTranslations });
    } catch (err: any) { alert(err.message); } finally { setLoadingTranslate(false); }
  };

  const triggerImageGen = async () => {
    if (loadingImg) return;
    const nextPromptIndex = currentDayImages.length;
    if (currentDayImages.length === 0) {
      setLoadingImg(true);
      try {
        console.log(`🎨 Generating image with aspect ratio: ${aspectRatio}`);
const url = await generateAIImage(day.image_prompts[0], undefined, undefined, imageEngine, aspectRatio);(day.image_prompts[0], undefined, undefined, imageEngine, aspectRatio);
        onImageGenerated({ dayIndex: day.day, promptIndex: 0, url, modelId: imageEngine, createdAt: Date.now() });
      } catch (err: any) { alert(err.message); } finally { setLoadingImg(false); }
      return;
    }
    if (!showImgEditPanel) { setShowImgEditPanel(true); return; }
    setLoadingImg(true);
    try {
      const existingBase64 = currentDayImages.length > 0 ? currentDayImages[currentDayImages.length - 1].url : undefined;
      console.log(`🎨 Regenerating image with aspect ratio: ${aspectRatio}`);
const url = await generateAIImage(day.image_prompts[0], imgEditFeedback, existingBase64, imageEngine, aspectRatio);
      onImageGenerated({ dayIndex: day.day, promptIndex: nextPromptIndex, url, modelId: imageEngine, createdAt: Date.now() });
      setShowImgEditPanel(false); setImgEditFeedback('');
    } catch (err: any) { alert(err.message); } finally { setLoadingImg(false); }
  };

  const handleAnimateVideo = async () => {
    if (loadingVid || currentDayVideos.length >= 3 || currentDayImages.length === 0) return;

    if (typeof (window as any).aistudio !== 'undefined' && !(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    setLoadingVid(true);
    try {
      const sourceImage = currentDayImages[currentDayImages.length - 1].url;
      const { url, uri, blob } = await generateAIVideo(
  sourceImage, 
  day.topic, 
  day.platform_strategy,
  day.content_type,  // NEW: strategic motion
  brandDNA            // NEW: brand alignment
);
      onVideoGenerated({ dayIndex: day.day, url, permanentUri: uri, version: currentDayVideos.length + 1, createdAt: Date.now(), modelId: videoEngine, blob });
    } catch (err: any) { 
      alert(err.message); 
      if (err.message && err.message.includes("Requested entity was not found")) {
         if (typeof (window as any).aistudio !== 'undefined') {
            await (window as any).aistudio.openSelectKey();
         }
      }
    } finally { setLoadingVid(false); }
  };

  const startManualEdit = (field: string, value: string) => { setEditField(field); setEditValue(value); };
  const saveManualEdit = () => {
    if (!editField) return;
    const updatedDay = { ...day };
    if (editField === 'hashtags') { (updatedDay as any)[editField] = editValue.split(/[\s,]+/).filter(t => t.trim().length > 0).map(t => t.startsWith('#') ? t : `#${t}`); }
    else { (updatedDay as any)[editField] = editValue; }
    onManualEdit(updatedDay);
    setEditField(null);
  };

  const handleDelete = () => {
    if (!activeAsset) return;
    if (window.confirm("Permanently delete this version from local intelligence vault?")) {
      if (onDeleteAsset) onDeleteAsset(activeAsset.url, activeAsset.type);
      setAssetIndex(Math.max(0, assetIndex - 1));
    }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 bento-glow" id="day-detail">
      <div className="bg-slate-900 px-10 py-12 text-white relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Day {day.day}</span>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${day.requires_video ? 'bg-rose-500' : 'bg-slate-700'}`}>{t[day.content_type]}</span>
              {day.requires_video && <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-rose-300 border border-rose-500/30"><Video className="w-3 h-3" /> Premium Recommended</span>}
            </div>
            <h2 className="text-4xl font-black leading-tight max-w-2xl tracking-tighter">{day.topic}</h2>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setShowRewritePanel(!showRewritePanel)} className={`shrink-0 px-8 py-5 rounded-3xl font-black text-xs transition-all flex items-center gap-2 border uppercase tracking-widest ${showRewritePanel ? 'bg-indigo-600 border-indigo-500 shadow-lg' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}>
                <Sparkles className="w-4 h-4" /> {t.rewrite}
             </button>
             <button onClick={() => { navigator.clipboard.writeText(`${day.hook}\n\n${day.full_caption}\n\n${day.cta}\n\n${day.hashtags.join(' ')}`); setCopied('Full'); setTimeout(() => setCopied(null), 2000); }} className="shrink-0 bg-white text-slate-900 px-8 py-5 rounded-3xl font-black text-xs hover:bg-slate-100 transition-all flex items-center gap-2 uppercase tracking-widest shadow-2xl">
               {copied === 'Full' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} {copied === 'Full' ? t.copied : t.copy_post}
             </button>
          </div>
        </div>
        {showRewritePanel && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-slate-800 p-10 z-[120] border-t border-white/5 animate-in slide-in-from-top duration-300 shadow-2xl">
            <div className="max-w-4xl mx-auto flex gap-4">
                <input autoFocus type="text" value={rewriteFeedback} onChange={e => setRewriteFeedback(e.target.value)} placeholder="e.g. Make it shorter, add more urgency..." className="flex-1 bg-white border border-white/10 rounded-2xl px-8 py-5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" onKeyDown={e => e.key === 'Enter' && onRegenerate(day, rewriteFeedback)} />
                <button onClick={() => onRegenerate(day, rewriteFeedback)} className="bg-indigo-600 px-10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all">Apply</button>
            </div>
          </div>
        )}
      </div>

      <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-10">
          <section className="p-8 bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Globe className="w-4 h-4" /> {t.localize_intel}</h3>
             </div>
             <div className="flex flex-col gap-4">
                <div className="flex bg-white/5 p-1.5 rounded-2xl gap-1">
                   {['English', 'Spanish', 'Other'].map(l => (
                     <button key={l} onClick={() => setTargetLang(l as any)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${targetLang === l ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>{l}</button>
                   ))}
                </div>
                {targetLang === 'Other' && <input type="text" value={customLang} onChange={e => setCustomLang(e.target.value)} placeholder="Language Name..." className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500" />}
                <button onClick={handleTranslate} disabled={loadingTranslate} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
                  {loadingTranslate ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-600" />} {t.translate_btn}
                </button>
             </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> {t.hook}</h3>
               <button onClick={() => startManualEdit('hook', day.hook)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><Edit3 className="w-4 h-4 text-slate-400" /></button>
            </div>
            {editField === 'hook' ? (
              <textarea autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveManualEdit} className="w-full p-8 border-2 border-indigo-500 rounded-3xl font-bold italic text-xl shadow-inner outline-none bg-white text-slate-900" />
            ) : <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-xl font-bold text-slate-900 leading-snug">"{day.hook}"</div>}
          </section>

          <section className="space-y-4">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-500" /> {t.caption}</h3>
                <button onClick={() => startManualEdit('full_caption', day.full_caption)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><Edit3 className="w-4 h-4 text-slate-400" /></button>
             </div>
             {editField === 'full_caption' ? (
               <textarea autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveManualEdit} className="w-full min-h-[400px] p-8 border-2 border-indigo-500 rounded-3xl font-medium leading-relaxed shadow-inner outline-none bg-white text-slate-900" />
             ) : <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap text-base font-medium min-h-[400px]">{day.full_caption}</div>}
          </section>

          <section className="space-y-4">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /> {t.cta}</h3>
                <button onClick={() => startManualEdit('cta', day.cta)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><Edit3 className="w-4 h-4 text-slate-400" /></button>
             </div>
             {editField === 'cta' ? (
               <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveManualEdit} className="w-full p-6 border-2 border-indigo-500 rounded-2xl font-black text-slate-900 outline-none bg-white" />
             ) : <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900 font-black text-sm uppercase tracking-widest">{day.cta}</div>}
          </section>

          <section className="space-y-4">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Hash className="w-4 h-4 text-rose-500" /> {t.hashtags}</h3>
                <button onClick={() => startManualEdit('hashtags', day.hashtags.join(' '))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><Edit3 className="w-4 h-4 text-slate-400" /></button>
             </div>
             {editField === 'hashtags' ? (
               <textarea autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveManualEdit} className="w-full p-6 border-2 border-indigo-500 rounded-2xl font-medium outline-none bg-white text-slate-900" />
             ) : <div className="flex flex-wrap gap-2 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                {day.hashtags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-white text-indigo-600 rounded-lg text-[10px] font-black shadow-sm border border-slate-100">{tag}</span>
                ))}
             </div>}
          </section>
        </div>

        <div className="space-y-10 lg:border-l lg:pl-16 border-slate-100">
           <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-inner">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.visual_architect}</p>
                    <div className="flex items-center gap-3 justify-end">
                       <span className="text-[8px] font-black text-slate-400 uppercase">{t.engine_slot}</span>
                       <div className="flex gap-1.5 bg-slate-200 p-1 rounded-xl">
                          <button onClick={() => setImageEngine('gemini')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${imageEngine === 'gemini' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>{t.standard}</button>
                          <button onClick={() => setImageEngine('qwen')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${imageEngine === 'qwen' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Qwen (Backup)</button>
                       </div>
                    </div>
                 </div>
             
  <div className="space-y-4">
    <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-3 ml-2">
      <LayoutGrid className="w-4 h-4 text-indigo-500" /> Image Dimensions
    </label>
    <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
      <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${aspectRatio === '9:16' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
        <div className="flex flex-col items-center gap-1">
          <div className="w-3 h-4 border-2 border-current rounded-sm"></div>
          <span className="text-[8px]">Portrait</span>
          <span className="text-[7px] opacity-60">9:16</span>
        </div>
      </button>
      <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${aspectRatio === '16:9' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
        <div className="flex flex-col items-center gap-1">
          <div className="w-4 h-3 border-2 border-current rounded-sm"></div>
          <span className="text-[8px]">Landscape</span>
          <span className="text-[7px] opacity-60">16:9</span>
        </div>
      </button>
      <button onClick={() => setAspectRatio('1:1')} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${aspectRatio === '1:1' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
        <div className="flex flex-col items-center gap-1">
          <div className="w-3 h-3 border-2 border-current rounded-sm"></div>
          <span className="text-[8px]">Square</span>
          <span className="text-[7px] opacity-60">1:1</span>
        </div>
      </button>
    </div>
    <p className="text-[8px] text-slate-400 italic px-2">
      Portrait: Instagram Stories, Reels | Landscape: YouTube, Blog | Square: Instagram Feed
    </p>
  </div>
                 {!showImgEditPanel ? (
                   <div className="flex gap-4 items-center">
                    <button onClick={triggerImageGen} disabled={loadingImg} className={`flex-[4] py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all ${activeAsset ? 'bg-slate-900 text-white hover:bg-black' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                       {loadingImg ? <RefreshCw className="w-4 h-4 animate-spin" /> : activeAsset ? <><Edit3 className="w-4 h-4" /> {t.edit_image}</> : <><Sparkles className="w-4 h-4" /> {t.create_image}</>} 
                    </button>
                    <button onClick={() => setShowOverlayDesigner(!showOverlayDesigner)} className={`flex-1 h-[60px] rounded-2xl border transition-all flex items-center justify-center group ${showOverlayDesigner ? 'bg-indigo-600 text-white shadow-lg border-indigo-500' : 'bg-indigo-600 text-white shadow-md border-indigo-500'}`} title="Text Architect">
                      <TypeIcon className={`w-6 h-6 ${showOverlayDesigner ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                    </button>
                   </div>
                 ) : (
                   <div className="w-full space-y-4 p-6 bg-slate-900 rounded-[2rem] shadow-2xl animate-in zoom-in duration-200">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{t.logic_correction}</p>
                        <button onClick={() => { setImgEditFeedback(''); setShowImgEditPanel(false); }} className="text-white/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                      <textarea autoFocus value={imgEditFeedback} onChange={e => setImgEditFeedback(e.target.value)} placeholder="e.g. 'Add more sunlight', 'Change character outfit'..." className="w-full p-4 rounded-xl text-sm font-bold bg-white border border-white/10 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none" />
                      <div className="flex gap-3">
                         <button onClick={() => setShowImgEditPanel(false)} disabled={loadingImg} className="flex-1 py-4 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase hover:bg-white/20 disabled:opacity-50 flex items-center justify-center gap-2"><Undo2 className="w-3.5 h-3.5" /> Back</button>
                         <button onClick={triggerImageGen} disabled={loadingImg} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-500 shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-80">
                            {loadingImg ? <><RefreshCw className="w-3 h-3 animate-spin" /> {t.processing}</> : t.apply_logic}
                         </button>
                      </div>
                   </div>
                 )}

                 <div className="flex gap-2 p-3 bg-white border border-slate-100 rounded-2xl overflow-x-auto scrollbar-hide shadow-sm">
                    <Palette className="w-5 h-5 text-slate-400 shrink-0 self-center mx-2" />
                    {VISUAL_MODES.map(mode => (
                      <button key={mode.id} onClick={() => setVisualFilter(mode.id)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase shrink-0 transition-all ${activeVisualMode === mode.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{mode.name}</button>
                    ))}
                 </div>
           </div>

           {showOverlayDesigner && (
              <div className="p-8 bg-white border-2 border-indigo-100 rounded-[2.5rem] space-y-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-indigo-600" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">{t.text_architect}</span>
                      <div className="flex items-center gap-2">
                        {saveStatus === 'saving' && (
                          <div className="flex items-center gap-2 text-amber-600 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span className="text-[9px] font-black uppercase">Saving...</span>
                          </div>
                        )}
                        {saveStatus === 'saved' && (
                          <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in duration-300">
                            <Check className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase">Saved</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex bg-slate-100 p-1 rounded-xl">
                          <button onClick={() => setGridMode(gridMode === 'thirds' ? 'none' : 'thirds')} className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-colors ${gridMode === 'thirds' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600 bg-white'}`}><Grid3X3 className="w-3.5 h-3.5" /> 1/3</button>
                          <button onClick={() => setGridMode(gridMode === 'golden' ? 'none' : 'golden')} className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-colors ${gridMode === 'golden' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-amber-500 bg-white'}`}><Sun className="w-3.5 h-3.5" /> Phi</button>
                       </div>
                       <button onClick={resetVisuals} className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors"><RotateCcw className="w-3 h-3" /> Reset All</button>
                       <div className="flex bg-slate-100 p-1 rounded-xl">
                          {currentLayers.map((_, i) => (
                            <button key={i} onClick={() => setActiveLayerIndex(i)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeLayerIndex === i ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>{t.layer} {i+1}</button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <textarea 
                      value={currentLayers[activeLayerIndex]?.text || ''} 
                      onChange={e => updateLayer(activeLayerIndex, { text: e.target.value })} 
                      className="w-full p-6 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-inner h-24 resize-none outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" 
                      placeholder="Enter text..." 
                    />
                    <div className="grid grid-cols-3 gap-2">
                       {FONTS.map(f => <button key={f.family} onClick={() => updateLayer(activeLayerIndex, { font: f.family })} className={`py-3 rounded-xl text-[9px] font-bold transition-all border ${currentLayers[activeLayerIndex]?.font === f.family ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-100 text-slate-500'}`} style={{ fontFamily: f.family }}>{f.name}</button>)}
                    </div>
                    <div className="space-y-4">
                       <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2"><LayoutTemplate className="w-3 h-3" /> Glass Labels</span>
                       <div className="grid grid-cols-4 gap-2">
                          {GLASS_OPTIONS.map(style => (
                            <button key={style.id} onClick={() => updateLayer(activeLayerIndex, { glassStyle: style.id as any })} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${currentLayers[activeLayerIndex]?.glassStyle === style.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-indigo-600'}`}>
                              <style.icon className="w-4 h-4" />
                              <span className="text-[7px] font-black uppercase">{style.label}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-3 ml-2"><Sliders className="w-4 h-4 text-indigo-500" /> Stroke & Outline</label>
                          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                             <input type="range" min="0" max="25" value={currentLayers[activeLayerIndex]?.strokeWidth || 0} onChange={e => updateLayer(activeLayerIndex, { strokeWidth: parseInt(e.target.value) })} className="flex-1 h-1 bg-slate-200 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
                             <input type="color" value={currentLayers[activeLayerIndex]?.strokeColor || '#000000'} onChange={e => updateLayer(activeLayerIndex, { strokeColor: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer border-none p-0" />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-3 ml-2"><Sun className="w-4 h-4 text-amber-500" /> Shadow Depth</label>
                          <input type="range" min="0" max="100" value={currentLayers[activeLayerIndex]?.shadowBlur || 0} onChange={e => updateLayer(activeLayerIndex, { shadowBlur: parseInt(e.target.value) })} className="w-full h-1 bg-slate-50 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-3 ml-2"><Maximize className="w-4 h-4 text-indigo-500" /> {t.scale}</label>
                          <input type="range" min="10" max="100" value={currentLayers[activeLayerIndex]?.size || 25} onChange={e => updateLayer(activeLayerIndex, { size: parseInt(e.target.value) })} className="w-full h-1 bg-slate-50 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-3 ml-2"><Palette className="w-4 h-4 text-rose-500" /> {t.text_color}</label>
                          <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => <button key={c.value} onClick={() => updateLayer(activeLayerIndex, { color: c.value })} className={`w-6 h-6 rounded-full border border-slate-200 ${currentLayers[activeLayerIndex]?.color === c.value ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`} style={{ backgroundColor: c.value }} />)}
                          </div>
                       </div>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900 p-4 rounded-3xl">
                       <div className="flex gap-2">
                          <button onClick={() => updateLayer(activeLayerIndex, { textAlign: 'left' })} className={`p-3 rounded-xl transition-all ${currentLayers[activeLayerIndex]?.textAlign === 'left' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><AlignLeft className="w-4 h-4" /></button>
                          <button onClick={() => updateLayer(activeLayerIndex, { textAlign: 'center' })} className={`p-3 rounded-xl transition-all ${currentLayers[activeLayerIndex]?.textAlign === 'center' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><AlignCenter className="w-4 h-4" /></button>
                          <button onClick={() => updateLayer(activeLayerIndex, { textAlign: 'right' })} className={`p-3 rounded-xl transition-all ${currentLayers[activeLayerIndex]?.textAlign === 'right' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><AlignRight className="w-4 h-4" /></button>
                       </div>
                       <button onClick={() => updateLayer(activeLayerIndex, { pos: { x: 50, y: 50 } })} className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-md flex items-center gap-2"><LayoutGrid className="w-3 h-3" /> Master Center</button>
                    </div>
                 </div>
              </div>
           )}

           <div className="space-y-6">
              {activeAsset && (
                <div className="space-y-6">
                  <div ref={previewRef} className={`relative ${aspectRatio === '16:9' ? 'aspect-[16/9] max-w-[600px]' : aspectRatio === '1:1' ? 'aspect-square max-w-[400px]' : 'aspect-[9/16] max-w-[340px]'} w-full mx-auto rounded-[3.5rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.2)] border-[14px] border-white group bg-slate-100`}>
                    <div className="absolute inset-0 z-20 pointer-events-none">
                      {activeSnapLines.y !== null && (
                        <div className={`absolute left-0 right-0 h-[1px] shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all ${gridMode === 'golden' ? 'bg-amber-400' : 'bg-indigo-400'}`} style={{ top: `${activeSnapLines.y}%` }} />
                      )}
                      {activeSnapLines.x !== null && (
                        <div className={`absolute top-0 bottom-0 w-[1px] shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all ${gridMode === 'golden' ? 'bg-amber-400' : 'bg-indigo-400'}`} style={{ left: `${activeSnapLines.x}%` }} />
                      )}
                    </div>
                    {activeAsset.type === 'video' ? (
                      <video key={activeAsset.url} src={activeAsset.url} controls autoPlay loop className={`w-full h-full object-cover ${VISUAL_MODES.find(m => m.id === activeVisualMode)?.class}`} />
                    ) : (
                      <div className="relative w-full h-full">
                        <img key={activeAsset.url} src={activeAsset.rawUrl} className={`w-full h-full object-cover transition-transform duration-[12000ms] ${motionSimulation ? 'scale-150 translate-y-[-10%]' : 'scale-100'} ${VISUAL_MODES.find(m => m.id === activeVisualMode)?.class}`} alt="Asset" />
                        {currentLayers.map((layer, i) => {
                          if (!layer) return null;
                          const fontSize = getProportionalFontSize(layer.size || 25, previewWidth);
                          return layer.text && (
                            <div key={i} onMouseDown={(e) => handleDragStart(e, i)} onTouchStart={(e) => handleDragStart(e, i)} 
                              style={{ left: `${layer.pos.x}%`, top: `${layer.pos.y}%`, transform: 'translate(-50%, -50%)', width: '85%', pointerEvents: showOverlayDesigner ? 'auto' : 'none', zIndex: activeLayerIndex === i ? 40 : 30 }} 
                              className={`absolute flex flex-col items-center justify-center select-none ${showOverlayDesigner ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                              <div className="relative w-full flex flex-col items-center">
                                {(layer.text || '').split('\n').map((line, lineIdx) => {
                                  if (!line || !line.trim()) return null;
                                  const glassClass = GLASS_OPTIONS.find(g => g.id === layer.glassStyle)?.class || '';
                                  return (
                                    <div key={lineIdx} className={`${glassClass} px-3 py-1 my-[0.1em] transition-all rounded-sm flex items-center justify-center`}>
                                      <h2 style={{ 
                                        color: layer.color || '#FFFFFF', 
                                        fontSize: `${fontSize}px`, 
                                        fontWeight: layer.isBold ? 900 : 500, 
                                        fontFamily: `'${layer.font || 'Anton'}', sans-serif`, 
                                        textShadow: layer.hasShadow ? `0 4px ${(layer.shadowBlur || 15)/4}px rgba(0,0,0,0.9)` : 'none',
                                        textAlign: layer.textAlign || 'center',
                                        WebkitTextStroke: (layer.strokeWidth || 0) > 0 ? `${((layer.strokeWidth || 0)/100) * fontSize}px ${layer.strokeColor || '#000000'}` : 'none'
                                      }} className="uppercase tracking-tight whitespace-nowrap leading-[1.1]">
                                        {line.trim()}
                                      </h2>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="absolute bottom-10 right-10 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={handleDownload} title="Download version" className="p-3.5 bg-white/95 backdrop-blur-xl rounded-[1.2rem] shadow-2xl hover:scale-110 active:scale-95 transition-transform"><Download className="w-5 h-5 text-slate-900" /></button>
                    </div>
                    <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={handleDelete} title="Delete version" className="p-3.5 bg-rose-500/95 backdrop-blur-xl rounded-[1.2rem] shadow-2xl hover:scale-110 active:scale-95 transition-transform"><Trash2 className="w-5 h-5 text-white" /></button>
                    </div>
                    <div className="absolute top-8 left-8 flex items-center gap-2">
                       <span className="bg-slate-900/80 backdrop-blur-xl text-white text-[9px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest border border-white/10 shadow-xl">{activeAsset.label}</span>
                       <button onClick={() => setMotionSimulation(!motionSimulation)} title="Motion Simulation" className={`p-2.5 rounded-full backdrop-blur-xl border border-white/10 shadow-xl transition-all ${motionSimulation ? 'bg-indigo-600 text-white rotate-12' : 'bg-white/30 text-white'}`}><Zap className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-white rounded-[2.5rem] border border-slate-100 overflow-x-auto scrollbar-hide shadow-sm items-center">
                     {galleryAssets.map((asset, idx) => (
                       <button key={idx} onClick={() => setAssetIndex(idx)} className={`shrink-0 w-24 h-40 rounded-3xl overflow-hidden border-4 transition-all relative ${assetIndex === idx ? 'border-indigo-600 scale-105 shadow-2xl ring-4 ring-indigo-50' : 'border-slate-50 opacity-40 hover:opacity-100 hover:scale-105'}`}>
                          {asset.type === 'video' ? <div className="w-full h-full bg-slate-900 flex items-center justify-center"><Film className="w-10 h-10 text-white" /></div> : <img src={asset.url} className="w-full h-full object-cover" />}
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded-lg text-[8px] font-black text-white uppercase">V{idx+1}</div>
                       </button>
                     ))}
                  </div>
                  {day.requires_video && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex items-center justify-between px-8 bg-slate-50 py-4 rounded-[2rem] border border-slate-100">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.engine_slot}</span>
                         <div className="flex gap-2 bg-slate-200 p-1.5 rounded-2xl">
                            <button onClick={() => setVideoEngine('gemini')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${videoEngine === 'gemini' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>{t.fast}</button>
                            <button onClick={() => setVideoEngine('qwen')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${videoEngine === 'qwen' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Qwen (Backup)</button>
                         </div>
                      </div>
                      <button onClick={handleAnimateVideo} disabled={loadingVid || currentDayVideos.length >= 3 || currentDayImages.length === 0} className={`w-full py-8 rounded-[3rem] text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-5 transition-all shadow-2xl ${loadingVid ? 'bg-slate-200 cursor-wait text-slate-500' : 'bg-slate-900 text-white hover:bg-black hover:scale-[1.02] group active:scale-95'}`}>
                        {loadingVid ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Film className="w-6 h-6 group-hover:scale-110 transition-transform" />} {loadingVid ? t.processing : t.render_video}
                      </button>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
