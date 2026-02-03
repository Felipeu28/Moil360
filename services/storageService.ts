
import { Project, StrategyResult, BusinessInfo, CacheEntry } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  PROJECTS: 'moil_vanguard_projects',
  STRATEGIES: 'moil_vanguard_strats_',
  MODE: 'moil_storage_mode',
  CIRCUIT: 'moil_vault_breaker'
};

const DB_NAME = 'MoilVanguardVault';
const DB_VERSION = 1;
const ASSET_STORE = 'assets';

class AssetVault {
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION + 1); // Bump version for index
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(ASSET_STORE)) {
          const store = db.createObjectStore(ASSET_STORE, { keyPath: 'id' });
          store.createIndex('projectId', 'projectId', { unique: false });
        } else {
          const store = request.transaction!.objectStore(ASSET_STORE);
          if (!store.indexNames.contains('projectId')) {
            store.createIndex('projectId', 'projectId', { unique: false });
          }
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async save(asset: { id: string; projectId: string; dayIndex: number; type: string; data: Blob; metadata: any }) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ASSET_STORE, 'readwrite');
      tx.objectStore(ASSET_STORE).put({ ...asset, createdAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAllForProject(projectId: string): Promise<any[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ASSET_STORE, 'readonly');
      const store = tx.objectStore(ASSET_STORE);
      const index = store.index('projectId');
      const request = index.getAll(projectId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string) {
    const db = await this.init();
    const tx = db.transaction(ASSET_STORE, 'readwrite');
    tx.objectStore(ASSET_STORE).delete(id);
  }
}

const vault = new AssetVault();

export class StorageService {
  private saveTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private inFlightSaves: Set<string> = new Set();
  private isHydrating: boolean = false;

  // Caching layer
  private projectsCache: CacheEntry<Project[]> | null = null;
  private readonly CACHE_TTL = 60000; // 1 minute cache
  private assetRequestQueue: Map<string, Promise<any[]>> = new Map();
  private blobUrlCache: Map<string, string> = new Map();

  private isLocalOnly(): boolean {
    return localStorage.getItem(STORAGE_KEYS.MODE) === 'local';
  }

  private isCircuitOpen(): boolean {
    if (this.isLocalOnly()) return true;
    const now = Date.now();
    const storedBreak = localStorage.getItem(STORAGE_KEYS.CIRCUIT);
    return storedBreak ? now < parseInt(storedBreak) : false;
  }

  private triggerCircuitBreaker(durationMs: number = 120000) { // Reduced 15min -> 2min
    const unstableUntil = Date.now() + durationMs;
    localStorage.setItem(STORAGE_KEYS.CIRCUIT, unstableUntil.toString());
    window.dispatchEvent(new CustomEvent('vanguard-circuit-tripped'));
  }

  setHydrating(status: boolean) {
    this.isHydrating = status;
  }

  async getProjects(): Promise<Project[]> {
    // Check cache first
    if (this.projectsCache && (Date.now() - this.projectsCache.timestamp < this.CACHE_TTL)) {
      return this.projectsCache.data;
    }

    const local = this.getLocalProjects();
    if (this.isCircuitOpen()) return local;

    try {
      const { data, error, status } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (status >= 500 || status === 429) {
        this.triggerCircuitBreaker();
        return local;
      }
      if (error) throw error;

      const remoteProjects = (data || []).map(p => ({ ...p, id: p.id_random || p.id }));
      this.saveLocalProjects(remoteProjects);

      // Cache the result
      this.projectsCache = { data: remoteProjects, timestamp: Date.now() };

      return remoteProjects;
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('timeout')) {
        this.triggerCircuitBreaker();
      }
      return local;
    }
  }

  private getLocalProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  }

  private saveLocalProjects(projects: Project[]) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  async createProject(name: string, industry: string, info: BusinessInfo): Promise<Project> {
    const localProjects = this.getLocalProjects();
    const tempId = `local_${Date.now()}`;
    const newProject: Project = {
      id: tempId,
      user_id: 'vanguard_user',
      name,
      industry,
      business_info: info,
      created_at: new Date().toISOString()
    };

    if (this.isCircuitOpen()) {
      this.saveLocalProjects([newProject, ...localProjects]);
      return newProject;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("AUTH_REQUIRED");

      const { data, error, status } = await supabase
        .from('projects')
        .insert({ user_id: user.id, name, industry, business_info: info })
        .select().single();

      if (status >= 500 || status === 429) {
        this.triggerCircuitBreaker();
        throw new Error("Vault Saturated");
      }

      if (error) throw error;
      const synced = { ...data, id: data.id_random || data.id };
      this.saveLocalProjects([synced, ...localProjects]);

      // Invalidate cache when creating project
      this.projectsCache = null;

      return synced;
    } catch (err: any) {
      this.saveLocalProjects([newProject, ...localProjects]);
      this.projectsCache = null;
      return newProject;
    }
  }

  async saveStrategy(projectId: string, strategy: StrategyResult, immediate: boolean = false): Promise<void> {
    localStorage.setItem(`${STORAGE_KEYS.STRATEGIES}${projectId}`, JSON.stringify(strategy));
    if (this.isHydrating || this.isCircuitOpen() || projectId.startsWith('local_')) return;

    const timeoutKey = `save_${projectId}`;
    const existingTimeout = this.saveTimeouts.get(timeoutKey);
    if (existingTimeout) clearTimeout(existingTimeout);

    if (immediate) {
      this.saveTimeouts.delete(timeoutKey);
      await this.performCloudSave(projectId, strategy);
      return;
    }

    const timeout = setTimeout(async () => {
      this.saveTimeouts.delete(timeoutKey);
      await this.performCloudSave(projectId, strategy);
    }, 5000);

    this.saveTimeouts.set(timeoutKey, timeout);
  }

  private async performCloudSave(projectId: string, strategy: StrategyResult) {
    if (this.inFlightSaves.has(projectId)) {
      this.saveStrategy(projectId, strategy);
      return;
    }

    this.inFlightSaves.add(projectId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const monthId = strategy.monthId || new Date().toISOString().slice(0, 7);
      const { data: existing, status } = await supabase
        .from('strategies')
        .select('id')
        .eq('project_id', projectId)
        .eq('month_id', monthId)
        .maybeSingle();

      if (status >= 500 || status === 429) {
        this.triggerCircuitBreaker();
        return;
      }

      if (existing) {
        const { error, status: patchStatus } = await supabase
          .from('strategies')
          .update({ data: strategy, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (patchStatus >= 500 || patchStatus === 429) this.triggerCircuitBreaker();
        if (error) throw error;
      } else {
        const { error, status: postStatus } = await supabase
          .from('strategies')
          .insert({ project_id: projectId, month_id: monthId, data: strategy });

        if (postStatus >= 500 || postStatus === 429) this.triggerCircuitBreaker();
        if (error) throw error;
      }
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('timeout')) {
        this.triggerCircuitBreaker();
      }
    } finally {
      this.inFlightSaves.delete(projectId);
    }
  }

  async getStrategy(projectId: string): Promise<StrategyResult | null> {
    const local = localStorage.getItem(`${STORAGE_KEYS.STRATEGIES}${projectId}`);
    const localData = local ? JSON.parse(local) : null;

    if (this.isCircuitOpen() || projectId.startsWith('local_')) return localData;

    try {
      const { data, status } = await supabase
        .from('strategies')
        .select('data')
        .eq('project_id', projectId)
        .is('archived_at', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (status >= 500 || status === 429) {
        this.triggerCircuitBreaker();
        return localData;
      }

      if (data?.data) {
        localStorage.setItem(`${STORAGE_KEYS.STRATEGIES}${projectId}`, JSON.stringify(data.data));
        return data.data;
      }
      return localData;
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('timeout')) {
        this.triggerCircuitBreaker();
      }
      return localData;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    const projects = this.getLocalProjects();
    this.saveLocalProjects(projects.filter(p => p.id !== projectId));
    localStorage.removeItem(`${STORAGE_KEYS.STRATEGIES}${projectId}`);

    // Invalidate cache when deleting project
    this.projectsCache = null;

    if (this.isCircuitOpen() || projectId.startsWith('local_')) return;
    try {
      await supabase.from('projects').delete().eq('id_random', projectId);
    } catch (err) { }
  }

  async getAssets(projectId: string): Promise<any[]> {
    // Request deduplication
    if (this.assetRequestQueue.has(projectId)) {
      return this.assetRequestQueue.get(projectId)!;
    }

    const requestPromise = this._fetchAssetsInternal(projectId);
    this.assetRequestQueue.set(projectId, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up queue after 100ms
      setTimeout(() => this.assetRequestQueue.delete(projectId), 100);
    }
  }

  private async _fetchAssetsInternal(projectId: string): Promise<any[]> {
    console.log(`📂 Loading assets for project ${projectId}...`);
    let cloudAssets: any[] = [];
    let localAssets: any[] = [];

    // Load from IndexedDB and manage persistent blob URLs
    try {
      const vaulted = await vault.getAllForProject(projectId);
      console.log(`💾 Found ${vaulted.length} assets in IndexedDB`);

      localAssets = vaulted.map(a => {
        let blobUrl = this.blobUrlCache.get(a.id);
        if (!blobUrl) {
          blobUrl = URL.createObjectURL(a.data);
          this.blobUrlCache.set(a.id, blobUrl);
          console.log(`🔗 Created blob URL for ${a.id}: ${blobUrl}`);
        }

        return {
          url: blobUrl,
          day_index: a.dayIndex,
          type: a.type,
          metadata: a.metadata || {},
          id: a.id,
          created_at: new Date(a.createdAt).toISOString(),
          source: 'indexeddb'
        };
      });
    } catch (err) { }

    if (this.isCircuitOpen()) {
      console.log(`⚠️ Circuit breaker open - returning ${localAssets.length} local assets only`);
      return localAssets;
    }

    // Load from cloud
    try {
      const { data, status } = await supabase
        .from('assets')
        .select('*')
        .eq('project_id', projectId);

      if (status < 500) {
        cloudAssets = (data || []).map(a => ({ ...a, source: 'cloud' }));
        console.log(`☁️ Found ${cloudAssets.length} assets in cloud`);
      } else {
        this.triggerCircuitBreaker();
      }
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('timeout')) {
        this.triggerCircuitBreaker();
      }
    }

    // Merge strategy: Prefer cloud URLs, fall back to local blob URLs
    const mergedAssets: any[] = [];
    const seenKeys = new Set<string>();

    cloudAssets.forEach(cloudAsset => {
      const key = `${cloudAsset.day_index}_${cloudAsset.type}_${cloudAsset.metadata?.promptIndex || 0}_${cloudAsset.metadata?.version || 1}`;
      seenKeys.add(key);
      mergedAssets.push(cloudAsset);
    });

    localAssets.forEach(localAsset => {
      const key = `${localAsset.day_index}_${localAsset.type}_${localAsset.metadata?.promptIndex || 0}_${localAsset.metadata?.version || 1}`;
      if (!seenKeys.has(key)) {
        mergedAssets.push(localAsset);
        console.log(`📍 Using local-only asset: ${key}`);
      }
    });

    console.log(`✅ Loaded ${mergedAssets.length} total assets`);
    return mergedAssets;
  }

  async uploadAsset(projectId: string, dayIndex: number, type: 'image' | 'video', blob: Blob, metadata: any = {}): Promise<string> {
    const assetId = `${projectId}_${type}_${dayIndex}_${Date.now()}`;
    try {
      await vault.save({ id: assetId, projectId, dayIndex, type, data: blob, metadata });
    } catch (err) { }
    if (this.isLocalOnly() || projectId.startsWith('local_')) {
      return URL.createObjectURL(blob);
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user_id = session?.user?.id;
      if (!user_id) throw new Error("UNAUTHENTICATED");
      const fileExt = type === 'image' ? 'png' : 'mp4';
      const fileName = `${projectId}/${type}_day${dayIndex}_${Date.now()}.${fileExt}`;
      const file = new File([blob], fileName, { type: type === 'image' ? 'image/png' : 'video/mp4' });
      const { data, error: uploadError } = await supabase.storage
        .from('Assets')
        .upload(fileName, file, { contentType: file.type, cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('Assets').getPublicUrl(data.path);
      const { error: dbError } = await supabase.from('assets').insert({
        user_id: user_id,
        project_id: projectId,
        day_index: dayIndex,
        type,
        url: publicUrl,
        metadata
      });
      if (dbError) throw dbError;
      return publicUrl;
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('timeout')) {
        this.triggerCircuitBreaker();
      }
      return URL.createObjectURL(blob);
    }
  }

  async deleteAsset(url: string): Promise<void> {
    if (this.isCircuitOpen()) return;
    try {
      await supabase.from('assets').delete().eq('url', url);
    } catch (err) { }
  }

  async getArchive(projectId: string): Promise<StrategyResult[]> {
    if (this.isCircuitOpen() || projectId.startsWith('local_')) return [];
    try {
      const { data, status } = await supabase
        .from('strategies')
        .select('data')
        .eq('project_id', projectId)
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false });
      if (status >= 500 || status === 429) {
        this.triggerCircuitBreaker();
        return [];
      }
      return (data || []).map(d => d.data);
    } catch (err) {
      if (err.message?.includes('fetch') || err.message?.includes('timeout')) {
        this.triggerCircuitBreaker();
      }
      return [];
    }
  }

  async finalizeStrategy(projectId: string, strategy: StrategyResult): Promise<void> {
    const archivedAt = new Date().toISOString();
    const monthId = strategy.monthId || archivedAt.slice(0, 7);

    // ✅ STRIP IMAGES/VIDEOS FOR ARCHIVE (Text-only memory)
    const leanCalendar = strategy.calendar.map(day => ({
      ...day,
      generatedImages: [],
      generatedVideos: [],
      finalImageUrl: undefined,
      finalVideoUrl: undefined,
      visualLayers: undefined
    }));

    const archivedStrategy = { ...strategy, calendar: leanCalendar, archivedAt };
    if (this.isCircuitOpen() || projectId.startsWith('local_')) {
      localStorage.setItem(`${STORAGE_KEYS.STRATEGIES}${projectId}_archive_${monthId}`, JSON.stringify(archivedStrategy));
      return;
    }
    try {
      const { status } = await supabase.from('strategies')
        .update({ archived_at: archivedAt, data: archivedStrategy })
        .eq('project_id', projectId)
        .eq('month_id', monthId);
      if (status >= 500 || status === 429) {
        this.triggerCircuitBreaker();
        throw new Error("Vault Timeout");
      }
    } catch (err: any) {
      if (err.message === "Vault Timeout") throw err;
      throw new Error(`Cloud Sync Unavailable.`);
    }
  }

  cleanupBlobUrls() {
    console.log(`🧹 Cleaning up ${this.blobUrlCache.size} cached blob URLs`);
    this.blobUrlCache.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.blobUrlCache.clear();
  }
}

export const storage = new StorageService();
