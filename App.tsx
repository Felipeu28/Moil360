import { vanguardFetch } from './services/geminiService';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, testSupabaseConnection } from './services/supabaseClient';
import { Project, StrategyResult, BusinessInfo, GeneratedImage, GeneratedVideo, OverlaySettings, ContentDay, Language, BrandDNA } from './types';
import { AuthGate } from './components/AuthGate';
import { Dashboard } from './components/Dashboard';
import { BusinessForm } from './components/BusinessForm';
import { CalendarGrid } from './components/CalendarGrid';
import { DayDetailView } from './components/DayDetailView';
import { ProjectPortal } from './components/ProjectPortal';
import { MonthOverView } from './components/MonthOverView';
import { generateContentStrategy, regenerateDay, fetchRemoteStrategy, generateCSV } from './services/geminiService';
import { storage } from './services/storageService';
import { translations } from './services/i18nService';
import { Layers, LogOut, ChevronLeft, Settings, TrendingUp, Globe, Search, RefreshCw, Database, CloudOff, AlertCircle, Construction } from 'lucide-react';

const safeDataURItoBlob = (dataURI: string) => {
  if (!dataURI.startsWith('data:')) return null;
  try {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (e) {
    console.error("Blob conversion failure:", e);
    return null;
  }
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isIsolated, setIsIsolated] = useState(() => localStorage.getItem('moil_storage_mode') === 'local');

  const [view, setView] = useState<'dashboard' | 'form' | 'strategy'>('dashboard');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [strategy, setStrategy] = useState<StrategyResult | null>(null);
  const [archive, setArchive] = useState<StrategyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<Language>('EN');
  const [selectedDay, setSelectedDay] = useState<ContentDay | null>(null);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'online' | 'offline' | 'maintenance' | 'testing'>('online');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [visualLayers, setVisualLayers] = useState<Record<string, OverlaySettings[]>>({});
  const [finalizedStrategy, setFinalizedStrategy] = useState<StrategyResult | null>(null);

  const checkCloud = useCallback(async (isInitial = false) => {
    if (isIsolated) return;

    const { ok, status, error } = await testSupabaseConnection(isInitial);
    if (status === 522 || status === 504 || status === 544 || status === 429) {
      setCloudStatus('maintenance');
      setErrorDetails("Database Unhealthy (522/544)");
    } else {
      setCloudStatus(ok ? 'online' : 'offline');
      if (!ok) setErrorDetails(error || "Connection Refused");
      else setErrorDetails(null);
    }
  }, [isIsolated]);

  useEffect(() => {
    const handleCircuitTrip = () => {
      setCloudStatus('maintenance');
      setErrorDetails("Database Cooling Down (Saturation Protection)");
    };

    // Lazy auth check - don't check until user interacts or 100ms has passed
    const initializeAuth = async () => {
      if (!isIsolated) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
        }
      }
    };

    const timer = setTimeout(initializeAuth, 100);

    // Subscribe to future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setView('dashboard');
        setActiveProject(null);
        setStrategy(null);
      }
    });

    window.addEventListener('vanguard-circuit-tripped', handleCircuitTrip);

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
      window.removeEventListener('vanguard-circuit-tripped', handleCircuitTrip);
      storage.cleanupBlobUrls();
    };
  }, [isIsolated]);

  const handleSelectDay = (day: ContentDay) => {
    storage.setHydrating(true);
    setSelectedDay(day);
    setTimeout(() => storage.setHydrating(false), 300);
  };

  const handleSelectProject = async (project: Project) => {
    if (project.id === 'new') {
      setActiveProject(null);
      // ✅ CRITICAL FIX: Clear asset states when starting a new project
      setGeneratedImages([]);
      setGeneratedVideos([]);
      setVisualLayers({});
      setView('form');
      return;
    }

    setIsLoading(true);
    try {
      storage.setHydrating(true);
      const [strat, assets, cloudArchive] = await Promise.all([
        storage.getStrategy(project.id),
        storage.getAssets(project.id),
        storage.getArchive(project.id)
      ]);

      console.log(`📦 Received ${assets?.length || 0} total assets for project ${project.id}`);

      const mappedImages: GeneratedImage[] = (assets || [])
        .filter(a => a.type === 'image')
        .map(a => {
          console.log(`🖼️ Loading image: Day ${a.day_index}, Prompt ${a.metadata?.promptIndex || 0}, Source: ${a.source}`);
          return {
            url: a.url,
            dayIndex: a.day_index,
            promptIndex: a.metadata?.promptIndex || 0,
            modelId: a.metadata?.modelId || 'gemini',
            createdAt: a.created_at ? new Date(a.created_at).getTime() : Date.now()
          };
        });

      const mappedVideos: GeneratedVideo[] = (assets || [])
        .filter(a => a.type === 'video')
        .map(a => {
          console.log(`🎬 Loading video: Day ${a.day_index}, Version ${a.metadata?.version || 1}, Source: ${a.source}`);
          return {
            url: a.url,
            dayIndex: a.day_index,
            version: a.metadata?.version || 1,
            createdAt: a.created_at ? new Date(a.created_at).getTime() : Date.now(),
            modelId: a.metadata?.modelId || 'gemini'
          };
        });

      console.log(`✅ Mapped ${mappedImages.length} images and ${mappedVideos.length} videos`);

      setActiveProject(project);
      setArchive(cloudArchive || []);

      if (strat) {
        if (strat.archivedAt) {
          console.log(`📜 Strategy is archived (${strat.monthId}). Entering Post-Mortem flow.`);
          setFinalizedStrategy(strat);
          setStrategy(null);
          setGeneratedImages([]); // Clear active assets for archived view
          setGeneratedVideos([]);
          setVisualLayers({});
        } else {
          setStrategy(strat);
          setGeneratedImages(mappedImages);
          setGeneratedVideos(mappedVideos);
          if (strat.visualLayers) setVisualLayers(strat.visualLayers);
          setSelectedDay(strat.calendar?.[0] || null);
          setView('strategy');
        }
      } else {
        setStrategy(null);
        setGeneratedImages([]);
        setGeneratedVideos([]);
        setVisualLayers({});
        setView('form');
      }
    } catch (err: any) {
      setActiveProject(project);
      setView('form');
    } finally {
      setIsLoading(false);
      setTimeout(() => storage.setHydrating(false), 500);
    }
  };

  const handleUpdateLayers = async (newLayers: Record<string, OverlaySettings[]>) => {
    setVisualLayers(newLayers);
    if (!strategy || !activeProject) return;
    const updatedStrategy = { ...strategy, visualLayers: newLayers };
    setStrategy(updatedStrategy);
    // Use immediate save for visual edits to ensure zero data loss and snappy feedback
    storage.saveStrategy(activeProject.id, updatedStrategy, true);
  };

  const handleFinalize = async () => {
    if (!strategy || !activeProject) return;
    setIsLoading(true);
    try {
      await storage.finalizeStrategy(activeProject.id, strategy);
      const cloudArchive = await storage.getArchive(activeProject.id);
      setArchive(cloudArchive);

      // ✅ RECURSIVE ENGINE: Show overview instead of immediately returning to dashboard
      setFinalizedStrategy(strategy);
      setStrategy(null);
      setIsPortalOpen(false);
    } catch (err: any) {
      alert(`Archive Error: ${err.message}. Strategy remains active locally.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKickoffNextMonth = async (combinedGuidance?: string) => {
    if (!finalizedStrategy || !activeProject) return;
    const history = finalizedStrategy;
    setFinalizedStrategy(null);
    setIsLoading(true);
    try {
      // ✅ CLEAR ASSET STATES FOR NEW MONTH
      setGeneratedImages([]);
      setGeneratedVideos([]);
      setVisualLayers({});

      const baseDate = history.context?.today || new Date().toISOString().split('T')[0];
      const nextMonthDate = new Date(baseDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const nextMonthLabel = nextMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

      const newProject = await storage.createProject(
        `${activeProject.name} (${nextMonthLabel})`,
        activeProject.industry,
        {
          ...activeProject.business_info,
          monthlyGuidance: combinedGuidance
        }
      );

      setActiveProject(newProject);

      const onProgress = async (partial: Partial<StrategyResult>) => {
        const fullPartial = partial as StrategyResult;
        setStrategy(fullPartial);
        await storage.saveStrategy(newProject.id, fullPartial);
      };

      const result = await generateContentStrategy(newProject.business_info, history, onProgress);
      await storage.saveStrategy(newProject.id, result);
      setStrategy(result);
      setSelectedDay(result.calendar[0]);
      setView('strategy');
    } catch (err: any) {
      alert(`Evolution Failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStrategy = async (info: BusinessInfo) => {
    setIsLoading(true);
    try {
      // ✅ ALWAYS CREATE NEW PROJECT FOR NEW BLUEPRINT (User requested isolation)
      const projectToUse = await storage.createProject(
        `${info.name} (Launch - ${new Date().toLocaleDateString()})`,
        info.industry,
        info
      );
      setActiveProject(projectToUse);

      // ✅ CRITICAL FIX: Clear all asset states for the new project
      setGeneratedImages([]);
      setGeneratedVideos([]);
      setVisualLayers({});

      const onProgress = async (partial: Partial<StrategyResult>) => {
        if (projectToUse) {
          const fullPartial = partial as StrategyResult;
          setStrategy(fullPartial);
          await storage.saveStrategy(projectToUse.id, fullPartial);
        }
      };

      const result = await generateContentStrategy(info, undefined, onProgress);
      await storage.saveStrategy(projectToUse.id, result);
      setStrategy(result);
      setSelectedDay(result.calendar[0]);
      setView('strategy');
    } catch (error: any) {
      alert(`Strategy Failure: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoteSync = async (url: string) => {
    setIsLoading(true);
    try {
      const result = await fetchRemoteStrategy(url);
      let projectToUse = activeProject;
      if (!projectToUse) {
        const title = result.summary?.slice(0, 20) || "Remote Sync";
        projectToUse = await storage.createProject(title, "Remote Sync", {
          name: title, industry: "Remote", targetAudience: "Synced", coreValues: "", mainGoals: ""
        });
        setActiveProject(projectToUse);
      }

      // ✅ CRITICAL FIX: Clear asset states for remote sync project
      setGeneratedImages([]);
      setGeneratedVideos([]);
      setVisualLayers({});

      await storage.saveStrategy(projectToUse.id, result);
      setStrategy(result);
      setSelectedDay(result.calendar?.[0] || null);
      setView('strategy');
    } catch (err: any) {
      alert(`Remote Sync Failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      const importedStrategy = importData.strategy || (importData.calendar ? importData : null);
      if (!importedStrategy) throw new Error("Invalid .moil file.");

      const project = await storage.createProject(
        (importData.business_info?.name || "Imported") + " (Restored)",
        "Restored",
        importData.business_info || {}
      );

      // ✅ CRITICAL FIX: Clear asset states for imported project
      setGeneratedImages([]);
      setGeneratedVideos([]);
      setVisualLayers({});

      await storage.saveStrategy(project.id, importedStrategy);
      setActiveProject(project);
      setStrategy(importedStrategy);
      if (importedStrategy.visualLayers) setVisualLayers(importedStrategy.visualLayers);
      setSelectedDay(importedStrategy.calendar[0]);
      setView('strategy');
      setIsPortalOpen(false);
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    } finally {
      setIsLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  // ============================================================================
  // LOCATION: App.tsx - Around line 140-240
  // REPLACE FROM handleRegenerate TO handleSignOut WITH THIS COMPLETE SECTION
  // ============================================================================

  const handleRegenerate = async (day: ContentDay, feedback: string) => {
    if (!strategy || !activeProject) return;
    setIsLoading(true);
    try {
      const updatedDay = await regenerateDay(activeProject.business_info, day, feedback);
      const newCalendar = strategy.calendar.map(d => d.day === day.day ? updatedDay : d);
      const newStrategy = { ...strategy, calendar: newCalendar };
      await storage.saveStrategy(activeProject.id, newStrategy);
      setStrategy(newStrategy);
      setSelectedDay(updatedDay);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAsset = async (url: string, type: 'image' | 'video') => {
    try {
      await storage.deleteAsset(url);
      if (type === 'image') setGeneratedImages(prev => prev.filter(img => img.url !== url));
      else setGeneratedVideos(prev => prev.filter(vid => vid.url !== url));
    } catch (err) { }
  };

  // ✅ NEW EXPORT FUNCTIONS START HERE
  const downloadFile = (content: string, fileName: string, type: string) => {
    try {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  const handleExportCSV = () => {
    if (!strategy) {
      alert("No active strategy found to export.");
      return;
    }
    const csvContent = generateCSV(strategy);
    const fileName = `Moil_Content360_${activeProject?.name.replace(/\s+/g, '_') || 'Strategy'}.csv`;
    downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
  };

  const handleExportArchiveCSV = (archivedStrategy: StrategyResult) => {
    const csvContent = generateCSV(archivedStrategy);
    const fileName = `Moil_Archive_${archivedStrategy.monthId}_${activeProject?.name.replace(/\s+/g, '_') || 'Strategy'}.csv`;
    downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
  };

  const handleExportMoil = () => {
    if (!strategy || !activeProject) {
      alert("Nothing to archive. Please generate a strategy first.");
      return;
    }

    const exportData = {
      version: "2.0",
      timestamp: new Date().toISOString(),
      project_name: activeProject.name,
      business_info: activeProject.business_info,
      strategy: strategy,
      visualLayers: visualLayers
    };

    try {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `${activeProject.name.replace(/\s+/g, '_')}_Backup.moil`;

      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Archive export failed:", error);
      alert("Archive export failed. Please try again.");
    }
  };
  // ✅ NEW EXPORT FUNCTIONS END HERE

  const handleSignOut = () => {
    localStorage.removeItem('moil_storage_mode');
    localStorage.removeItem('moil_vault_breaker');
    setIsIsolated(false);
    setSession(null);
    supabase.auth.signOut();
    storage.cleanupBlobUrls();
  };

  if (!session && !isIsolated) {
    return <AuthGate
      onAuthSuccess={(sess: Session) => setSession(sess)}
      onIsolatedMode={() => setIsIsolated(true)}
    />;
  }

  const t = translations[lang] || translations['EN'];

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30">
      <nav className="border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { setView('dashboard'); setActiveProject(null); setStrategy(null); setGeneratedImages([]); setGeneratedVideos([]); setVisualLayers({}); }}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-indigo-600/20 group-hover:rotate-0 transition-transform">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tighter uppercase block leading-none">{t.app_title}</span>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">COMMAND CENTER</span>
                <div className={`w-1.5 h-1.5 rounded-full ${isIsolated ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : (cloudStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]')}`} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {(cloudStatus !== 'online' || isIsolated) && (
              <div className={`flex items-center gap-2 px-4 py-2 border rounded-xl animate-pulse ${isIsolated ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : (cloudStatus === 'maintenance' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500')}`}>
                {isIsolated ? <ShieldAlert className="w-4 h-4" /> : (cloudStatus === 'maintenance' ? <Construction className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />)}
                <span className="text-[8px] font-black uppercase tracking-widest">{isIsolated ? 'Isolated Hub' : 'Vault Maintenance'}</span>
              </div>
            )}
            {!isIsolated && (
              <button onClick={() => checkCloud(true)} className="p-2 hover:bg-white/5 rounded-xl transition-all" title="Sync Status Check">
                <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            {activeProject && (
              <button onClick={() => setIsPortalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                <Settings className="w-4 h-4" /> {t.portal_btn}
              </button>
            )}
            {view !== 'dashboard' && (
              <button onClick={() => { setView('dashboard'); setActiveProject(null); setStrategy(null); }} className="text-[10px] font-black text-slate-400 hover:text-white flex items-center gap-2 uppercase tracking-widest transition-all">
                <ChevronLeft className="w-4 h-4" /> Hub
              </button>
            )}
            <div className="h-8 w-[1px] bg-white/10" />
            <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 hover:bg-rose-500/10 rounded-xl transition-all text-slate-400 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest">
              <LogOut className="w-4 h-4" /> {t.sign_out}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1800px] mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-8">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
              <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Syncing Vault Intel</p>
          </div>
        ) : (
          <>
            {cloudStatus === 'maintenance' && !isIsolated && (
              <div className="mb-12 p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] flex items-center gap-6 animate-in slide-in-from-top duration-700">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-tight text-amber-400">Cloud Instability: {errorDetails}</h3>
                  <p className="text-xs font-medium text-amber-200/60 uppercase tracking-widest leading-relaxed">The database is currently saturated. Your changes are being cached locally. We recommend switching to **Isolated Mode** for zero-latency performance until the cloud recovers.</p>
                </div>
              </div>
            )}

            {view === 'dashboard' && <Dashboard onSelectProject={handleSelectProject} />}
            {view === 'form' && (
              <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                <BusinessForm lang={lang} onStart={handleCreateStrategy} onRemoteSync={handleRemoteSync} onImport={handleImport} isLoading={isLoading} />
              </div>
            )}
            {view === 'strategy' && strategy && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Database className="w-32 h-32" />
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transition-transform">
                        <Layers className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{activeProject?.name}</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">{activeProject?.industry}</p>
                      </div>
                    </div>
                    <div className="mt-8 flex items-end justify-between border-t border-white/5 pt-6 relative z-10">
                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Focus</span>
                        <div className="text-sm font-black text-indigo-400 uppercase tracking-tight">{strategy.context?.seasonalFocus || 'Neural Strategy Active'}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Health</span>
                        <div className="text-3xl font-black text-indigo-500 leading-none">{strategy.quality_score || 0}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-5 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.synthesis}</span>
                      </div>
                    </div>
                    <div className="flex-1 text-sm font-medium text-slate-300 leading-relaxed whitespace-pre-wrap italic opacity-80 overflow-y-auto max-h-[160px] scrollbar-hide pr-2">
                      {strategy.summary || "Synthesis generating..."}
                    </div>
                  </div>
                  <div className="lg:col-span-3 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-4 h-4 text-sky-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grounding</span>
                      </div>
                      <div className="space-y-2">
                        {strategy.insights?.slice(0, 3).map((insight, idx) => (
                          <a key={idx} href={insight.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all group">
                            <Search className="w-3 h-3 text-slate-500 group-hover:text-sky-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">{insight.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <CalendarGrid lang={lang} calendar={strategy.calendar || []} generatedImages={generatedImages} generatedVideos={generatedVideos} onSelectDay={handleSelectDay} selectedDay={selectedDay || undefined} />

                {selectedDay && (
                  <DayDetailView
                    key={selectedDay.day}
                    lang={lang}
                    day={selectedDay}
                    generatedImages={generatedImages}
                    generatedVideos={generatedVideos}
                    onImageGenerated={async (img) => {
                      const tempId = img.createdAt;
                      const originalUrl = img.url;
                      setGeneratedImages(p => [...p, img]);

                      if (activeProject) {
                        try {
                          const blob = safeDataURItoBlob(img.url);
                          if (blob) {
                            const publicUrl = await storage.uploadAsset(activeProject.id, img.dayIndex, 'image', blob, {
                              modelId: img.modelId,
                              promptIndex: img.promptIndex
                            });
                            setGeneratedImages(prev => prev.map(item => item.dayIndex === img.dayIndex && item.createdAt === tempId ? { ...item, url: publicUrl } : item));
                            setVisualLayers(prev => {
                              const layers = prev[originalUrl];
                              if (layers) {
                                const next = { ...prev };
                                delete next[originalUrl];
                                next[publicUrl] = layers;
                                return next;
                              }
                              return prev;
                            });
                          }
                        } catch (err) { }
                      }
                    }}
                    onVideoGenerated={async (vid: GeneratedVideo) => {
                      const tempId = vid.createdAt;
                      const originalUrl = vid.url;
                      setGeneratedVideos(p => [...p, vid]);

                      if (activeProject && vid.blob) {
                        try {
                          const publicUrl = await storage.uploadAsset(activeProject.id, vid.dayIndex, 'video', vid.blob, {
                            modelId: vid.modelId,
                            version: vid.version
                          });
                          setGeneratedVideos(prev => prev.map(item => item.dayIndex === vid.dayIndex && item.createdAt === tempId ? { ...item, url: publicUrl } : item));
                          setVisualLayers(prev => {
                            const layers = prev[originalUrl];
                            if (layers) {
                              const next = { ...prev };
                              delete next[originalUrl];
                              next[publicUrl] = layers;
                              return next;
                            }
                            return prev;
                          });
                        } catch (err) { }
                      }
                    }}
                    onDeleteAsset={handleDeleteAsset}
                    onRegenerate={handleRegenerate}
                    onManualEdit={async (updatedDay: ContentDay) => {
                      if (!strategy || !activeProject) return;

                      // ✅ WEEK 1 FIX: Enhanced text edit persistence
                      const newCalendar = strategy.calendar.map(d =>
                        d.day === updatedDay.day ? updatedDay : d
                      );

                      const updatedStrategy = { ...strategy, calendar: newCalendar };

                      // Update state immediately for responsiveness
                      setStrategy(updatedStrategy);

                      // Save to database with comprehensive error handling
                      try {
                        await storage.saveStrategy(activeProject.id, updatedStrategy, true);
                        console.log('✅ Text edits saved successfully');
                      } catch (err: any) {
                        console.error('❌ Failed to save text edits:', err);

                        // User-friendly error message
                        alert(
                          `⚠️ Save Failed: ${err.message}\n\n` +
                          `Your changes are cached locally but may not sync to cloud.\n\n` +
                          `Please try refreshing the page.`
                        );

                        // Revert to previous strategy if save failed
                        setStrategy(strategy);
                      }
                    }}
                    visualLayers={visualLayers}
                    onUpdateLayers={handleUpdateLayers}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {activeProject && (
        <ProjectPortal
          isOpen={isPortalOpen}
          onClose={() => setIsPortalOpen(false)}
          projectKey={activeProject.id}
          onSignOut={handleSignOut}
          onExport={handleExportMoil}
          onExportCSV={handleExportCSV}
          onExportArchiveCSV={handleExportArchiveCSV}
          onImport={handleImport}
          onFinalize={handleFinalize}
          strategy={strategy}
          archive={archive}
          onSwitchMonth={(s) => setStrategy(s)}
          brandDNA={activeProject.business_info?.brandDNA}
          onUpdateBrand={() => { }}
          lang={lang}
          isCloudEnabled={cloudStatus === 'online'}
          assetSummary={{ images: generatedImages.length, videos: generatedVideos.length }}
        />
      )}

      {finalizedStrategy && (
        <MonthOverView
          strategy={finalizedStrategy}
          lang={lang}
          onKickoff={handleKickoffNextMonth}
          onClose={() => { setFinalizedStrategy(null); setView('dashboard'); }}
          assetSummary={{ images: generatedImages.length, videos: generatedVideos.length }}
        />
      )}
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

export default App;
