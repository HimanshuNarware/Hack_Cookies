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
    <div className="flex flex-col h-screen w-full max-w-[500px] min-w-[450px] mx-auto bg-navy-900 text-gray-100 font-sans relative">
      {/* Header */}
      <header className="flex flex-col gap-3 p-4 border-b border-gray-800 bg-navy-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-500/20 rounded-lg border border-primary-500/30">
              <Code2 size={20} className="text-primary-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Dev Editor</h1>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">{currentUrl || 'No active page'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <label className="p-1.5 text-gray-400 hover:text-white hover:bg-navy-700 rounded-md transition-colors cursor-pointer" title="Import JSON">
              <Upload size={16} />
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button onClick={handleExport} className="p-1.5 text-gray-400 hover:text-white hover:bg-navy-700 rounded-md transition-colors" title="Export JSON">
              <Download size={16} />
            </button>
            <div className="w-px h-4 bg-gray-700 mx-1"></div>
            <button 
              onClick={() => loadData()} 
              className="p-1.5 text-gray-400 hover:text-white hover:bg-navy-700 rounded-md transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-navy-950/50 rounded-lg border border-gray-800">
          <button onClick={() => setActiveTab('local')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'local' ? 'bg-navy-700 text-white shadow-sm border border-gray-600/50' : 'text-gray-400 hover:text-gray-200 hover:bg-navy-800/50'}`}>
            <HardDrive size={14} /> Local
          </button>
          <button onClick={() => setActiveTab('session')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'session' ? 'bg-navy-700 text-white shadow-sm border border-gray-600/50' : 'text-gray-400 hover:text-gray-200 hover:bg-navy-800/50'}`}>
            <Database size={14} /> Session
          </button>
          <button onClick={() => setActiveTab('cookies')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'cookies' ? 'bg-navy-700 text-white shadow-sm border border-gray-600/50' : 'text-gray-400 hover:text-gray-200 hover:bg-navy-800/50'}`}>
            <Cookie size={14} /> Cookies
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Filter keys..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-950/50 border border-gray-700 rounded-md pl-8 pr-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-600 transition-all"
            />
          </div>
          <button onClick={() => setShowAddModal(true)} className="p-1.5 text-gray-400 hover:text-white hover:bg-navy-700 rounded-md border border-gray-700 transition-colors" title="Add New">
            <Plus size={16} />
          </button>
          <button onClick={handleClearAll} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md border border-red-900/30 transition-colors" title="Clear All">
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy-900/50 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={24} className="animate-spin text-primary-500" />
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <h3 className="font-medium text-white text-sm">Add New {activeTab === 'cookies' ? 'Cookie' : 'Item'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Key / Name</label>
                <input value={newKey} onChange={e => setNewKey(e.target.value)} className="input-field" placeholder="e.g. auth_token" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Value</label>
                <textarea value={newValue} onChange={e => setNewValue(e.target.value)} className="input-field resize-y min-h-[80px]" placeholder="{...}" />
              </div>
            </div>
            <div className="p-3 border-t border-gray-700 flex justify-end gap-2 bg-navy-800/50">
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
