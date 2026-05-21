import { create } from 'zustand';
import { StorageItem, CookieItem, getActiveTab, getLocalStorage, getSessionStorage, getCookies } from '../utils/chrome';

interface AppState {
  activeTab: 'local' | 'session' | 'cookies';
  setActiveTab: (tab: 'local' | 'session' | 'cookies') => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  currentUrl: string;
  currentTabId: number | null;
  
  localData: StorageItem[];
  sessionData: StorageItem[];
  cookieData: CookieItem[];
  
  isLoading: boolean;
  
  loadData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, _) => ({
  activeTab: 'local',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  currentUrl: '',
  currentTabId: null,
  
  localData: [],
  sessionData: [],
  cookieData: [],
  
  isLoading: true,
  
  loadData: async () => {
    set({ isLoading: true });
    try {
      const tab = await getActiveTab();
      if (!tab || !tab.id || !tab.url) {
        set({ isLoading: false });
        return;
      }
      
      const tabId = tab.id;
      const url = new URL(tab.url).origin;
      
      const [local, session, cookies] = await Promise.all([
        getLocalStorage(tabId),
        getSessionStorage(tabId),
        getCookies(url)
      ]);
      
      set({
        currentTabId: tabId,
        currentUrl: url,
        localData: local,
        sessionData: session,
        cookieData: cookies,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading data:', error);
      set({ isLoading: false });
    }
  }
}));
