import React, { useEffect, useState } from 'react';
import { Project } from '../types';
import { storage } from '../services/storageService';
import { Briefcase, Plus, Search, Calendar, Globe, ArrowRight, Zap, TrendingUp, Trash2, AlertTriangle, X } from 'lucide-react';

interface Props {
  onSelectProject: (p: Project) => void;
}

export const Dashboard: React.FC<Props> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState(0);

  useEffect(() => {
    // Skip if recently fetched (within 1 minute)
    const now = Date.now();
    if (now - lastFetch < 60000 && projects.length > 0) {
      setLoading(false);
      return;
    }

    storage.getProjects().then((fetchedProjects) => {
      setProjects(fetchedProjects);
      setLastFetch(Date.now());
    }).finally(() => setLoading(false));
  }, []); // Empty dependency array means this runs on mount

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent opening the project
    
    if (deletingId !== projectId) {
      setDeletingId(projectId);
      return;
    }

    try {
      await storage.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setDeletingId(null);
    } catch (err) {
      alert("Failed to purge project from vault.");
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(null);
  };

  if (loading) return null;

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">Intelligence Hub</h1>
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Multi-Vertical Operations</p>
        </div>
        
        <button 
          onClick={() => onSelectProject({ id: 'new', name: '', industry: '', user_id: '', created_at: '', business_info: {} as any })}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Strategy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project.id} className="relative group">
            <button 
              onClick={() => onSelectProject(project)}
              className="w-full relative glass-card p-10 rounded-[3rem] text-left transition-all hover:border-indigo-500/50 hover:bg-white/5 border border-white/5 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                <Zap className="w-24 h-24 text-indigo-500" />
              </div>

              <div className="space-y-6 relative z-10">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-indigo-600 transition-colors">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white group-hover:text-indigo-400 transition-colors leading-none">{project.name}</h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 block">{project.industry}</span>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" /> 30-Day Logic Active
                  </div>
                  <ArrowRight className="w-5 h-5 text-indigo-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            </button>

            {/* DELETION CONTROLS */}
            <div className="absolute top-6 right-6 z-20 flex gap-2">
              {deletingId === project.id ? (
                <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                  <button 
                    onClick={cancelDelete}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                    title="Cancel Purge"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, project.id)}
                    className="flex items-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse"
                  >
                    <AlertTriangle className="w-4 h-4" /> Confirm Purge
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => handleDelete(e, project.id)}
                  className="p-3 bg-white/5 hover:bg-rose-600/20 text-slate-500 hover:text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-rose-500/30"
                  title="Purge Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-white/5 rounded-[4rem] p-24 text-center space-y-8">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="w-12 h-12 text-slate-700" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-400">No Intelligence Active</h2>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Start your first market-aligned strategy today.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};