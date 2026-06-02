import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatBytes, setLocalStorageItem, setSessionStorageItem, removeLocalStorageItem, removeSessionStorageItem } from '../utils/chrome';
import { Edit2, Trash2, Copy, Check } from 'lucide-react';

interface StorageTableProps {
  type: 'local' | 'session';
}

const StorageTable: React.FC<StorageTableProps> = ({ type }) => {
  const { localData, sessionData, searchQuery, currentTabId, loadData } = useAppStore();
  const data = type === 'local' ? localData : sessionData;
  
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredData = data.filter(item => 
    item.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };

  const handleSave = async (key: string) => {
    if (!currentTabId) return;
    if (type === 'local') {
      await setLocalStorageItem(currentTabId, key, editValue);
    } else {
      await setSessionStorageItem(currentTabId, key, editValue);
    }
    setEditingKey(null);
    loadData();
  };

  const handleDelete = async (key: string) => {
    if (!currentTabId) return;
    if (type === 'local') {
      await removeLocalStorageItem(currentTabId, key);
    } else {
      await removeSessionStorageItem(currentTabId, key);
    }
    loadData();
  };

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
        <div className="w-16 h-16 bg-charcoal rounded-full flex items-center justify-center mb-4 border border-charcoal/50 shadow-inner">
          <span className="text-2xl opacity-50">📭</span>
        </div>
        <p className="text-sm font-medium text-gray-400">No {type} storage found</p>
        {searchQuery && <p className="text-xs mt-1 text-gray-600">Try adjusting your search</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {filteredData.map((item) => (
        <div key={item.key} className="glass-panel p-4 flex flex-col gap-3 group hover:border-vivid-orange/30 transition-colors relative overflow-hidden">
          {/* Subtle indicator bar for item type */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-vivid-orange/80"></div>
          
          <div className="flex items-start justify-between gap-2 pl-2">
            <div className="font-mono text-sm font-bold text-vivid-orange break-all">
              {item.key}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => handleCopy(item.value, item.key)} className="p-1.5 hover:bg-obsidian-deep rounded-full text-gray-400 hover:text-vivid-orange transition-colors">
                {copiedKey === item.key ? <Check size={14} className="text-neon-lime" /> : <Copy size={14} />}
              </button>
              <button onClick={() => handleEdit(item.key, item.value)} className="p-1.5 hover:bg-obsidian-deep rounded-full text-gray-400 hover:text-vivid-orange transition-colors">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(item.key)} className="p-1.5 hover:bg-red-900/30 rounded-full text-gray-400 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          
          <div className="bg-obsidian-deep rounded-xl p-3 border border-charcoal/50 ml-2">
            {editingKey === item.key ? (
              <div className="flex flex-col gap-2">
                <textarea 
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="input-field resize-y min-h-[60px] rounded-xl"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditingKey(null)} className="text-xs px-3 py-1.5 text-gray-400 hover:text-pure-white rounded-full hover:bg-charcoal transition-colors">Cancel</button>
                  <button onClick={() => handleSave(item.key)} className="text-xs px-4 py-1.5 bg-vivid-orange hover:bg-vivid-orange/90 text-obsidian-deep font-bold rounded-full transition-colors shadow-[0_0_10px_rgba(255,157,51,0.2)]">Save</button>
                </div>
              </div>
            ) : (
              <div className="font-mono text-xs font-medium text-pure-white/90 break-all max-h-32 overflow-y-auto custom-scrollbar">
                {item.value}
              </div>
            )}
          </div>
          
          <div className="flex justify-end text-[10px] text-gray-500 font-bold tracking-wider uppercase ml-2">
            {formatBytes(item.size)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StorageTable;
