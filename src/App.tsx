import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Database, HardDrive, Cookie, Search, RefreshCw, Plus, Trash2, Code2, Download, Upload, X } from 'lucide-react';
import { clearLocalStorage, clearSessionStorage, setCookie, setLocalStorageItem, setSessionStorageItem } from './utils/chrome';
import StorageTable from './components/StorageTable';
import CookieTable from './components/CookieTable';

function App() {
  const { 
    activeTab, setActiveTab, 
    searchQuery, setSearchQuery, 
    isLoading, loadData,
    currentTabId, currentUrl,
    localData, sessionData, cookieData
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClearAll = async () => {
    if (!currentTabId) return;
    if (confirm(`Are you sure you want to clear all ${activeTab === 'local' ? 'Local Storage' : activeTab === 'session' ? 'Session Storage' : 'Cookies'}?`)) {
      if (activeTab === 'local') {
        await clearLocalStorage(currentTabId);
      } else if (activeTab === 'session') {
        await clearSessionStorage(currentTabId);
      } else {
        // Clear cookies logic
      }
      loadData();
    }
  };

  const handleAdd = async () => {
    if (!currentTabId || !newKey) return;
    if (activeTab === 'local') {
      await setLocalStorageItem(currentTabId, newKey, newValue);
    } else if (activeTab === 'session') {
      await setSessionStorageItem(currentTabId, newKey, newValue);
    } else if (activeTab === 'cookies' && currentUrl) {
      await setCookie(currentUrl, { name: newKey, value: newValue, domain: new URL(currentUrl).hostname, path: '/' });
    }
    setShowAddModal(false);
    setNewKey('');
    setNewValue('');
    loadData();
  };

  const handleExport = () => {
    let dataToExport = {};
    if (activeTab === 'local') dataToExport = localData;
    else if (activeTab === 'session') dataToExport = sessionData;
    else dataToExport = cookieData;

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deveditor_${activeTab}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && currentTabId && currentUrl) {
          for (const item of json) {
            if (activeTab === 'local' && item.key) await setLocalStorageItem(currentTabId, item.key, item.value || '');
            if (activeTab === 'session' && item.key) await setSessionStorageItem(currentTabId, item.key, item.value || '');
            if (activeTab === 'cookies' && item.name) await setCookie(currentUrl, item);
          }
          loadData();
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-[500px] min-w-[450px] mx-auto bg-obsidian-deep text-pure-white font-sans relative">
      {/* Header */}
      <header className="flex flex-col gap-3 p-4 border-b border-charcoal/50 bg-charcoal/30 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-kinetic-amber/20 rounded-lg border border-kinetic-amber/30">
              <Code2 size={20} className="text-kinetic-amber" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-pure-white font-sans uppercase">Cookie Crumbs</h1>
              <p className="text-xs text-gray-400 truncate max-w-[200px] font-mono">{currentUrl || 'No active page'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <label className="p-1.5 text-gray-400 hover:text-kinetic-amber hover:bg-charcoal rounded-full transition-colors cursor-pointer" title="Import JSON">
              <Upload size={16} />
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button onClick={handleExport} className="p-1.5 text-gray-400 hover:text-kinetic-amber hover:bg-charcoal rounded-full transition-colors" title="Export JSON">
              <Download size={16} />
            </button>
            <div className="w-px h-4 bg-charcoal mx-1"></div>
            <button 
              onClick={() => loadData()} 
              className="p-1.5 text-gray-400 hover:text-kinetic-amber hover:bg-charcoal rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Tabs - Now at bottom per spec, removing from here later or keep as top tabs but style? The spec says "Bottom Navigation: Fixed at the bottom with three tabs". Let's move them down. */}
        {/* Wait, the spec says "Fixed at the bottom". I'll move this block to the bottom. */}
        {/* I'll remove the tabs from here and add them below main content. */}

        {/* Toolbar */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Filter keys..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 pr-3 py-1.5"
            />
          </div>
          <button onClick={() => setShowAddModal(true)} className="p-1.5 text-gray-400 hover:text-kinetic-amber hover:bg-charcoal rounded-full border border-charcoal/50 transition-colors" title="Add New">
            <Plus size={16} />
          </button>
          <button onClick={handleClearAll} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full border border-red-900/30 transition-colors" title="Clear All">
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative pb-20">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-obsidian-deep/80 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={24} className="animate-spin text-kinetic-amber" />
              <p className="text-sm text-gray-400">Loading data...</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'local' && <StorageTable type="local" />}
          {activeTab === 'session' && <StorageTable type="session" />}
          {activeTab === 'cookies' && <CookieTable />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-4 left-4 right-4 flex justify-center z-10 pointer-events-none">
        <div className="flex bg-charcoal p-1.5 rounded-full border border-charcoal/50 shadow-lg pointer-events-auto">
          <button onClick={() => setActiveTab('cookies')} className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold rounded-full transition-all ${activeTab === 'cookies' ? 'bg-kinetic-amber text-obsidian-deep shadow-[0_0_15px_rgba(255,179,0,0.3)]' : 'text-gray-400 hover:text-pure-white hover:bg-obsidian-deep'}`}>
            <Cookie size={16} /> Cookies
          </button>
          <button onClick={() => setActiveTab('session')} className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold rounded-full transition-all ${activeTab === 'session' ? 'bg-vivid-orange text-obsidian-deep shadow-[0_0_15px_rgba(255,157,51,0.3)]' : 'text-gray-400 hover:text-pure-white hover:bg-obsidian-deep'}`}>
            <Database size={16} /> Session
          </button>
          <button onClick={() => setActiveTab('local')} className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold rounded-full transition-all ${activeTab === 'local' ? 'bg-vivid-orange text-obsidian-deep shadow-[0_0_15px_rgba(255,157,51,0.3)]' : 'text-gray-400 hover:text-pure-white hover:bg-obsidian-deep'}`}>
            <HardDrive size={16} /> Local
          </button>
        </div>
      </nav>

      {/* Add Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-obsidian-deep/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-charcoal rounded-[24px] border border-charcoal/50 shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-obsidian-deep">
              <h3 className="font-bold text-pure-white text-sm uppercase tracking-wide">Add New {activeTab === 'cookies' ? 'Cookie' : 'Item'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-kinetic-amber rounded-full p-1 hover:bg-obsidian-deep transition-colors"><X size={16} /></button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Key / Name</label>
                <input value={newKey} onChange={e => setNewKey(e.target.value)} className="input-field font-mono" placeholder="e.g. auth_token" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Value</label>
                <textarea value={newValue} onChange={e => setNewValue(e.target.value)} className="input-field font-mono resize-y min-h-[80px] rounded-[16px]" placeholder="{...}" />
              </div>
            </div>
            <div className="p-4 border-t border-obsidian-deep flex justify-end gap-3 bg-charcoal/50">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleAdd} disabled={!newKey} className="btn-primary">Add Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
