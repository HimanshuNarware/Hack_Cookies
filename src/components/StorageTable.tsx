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
        <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center mb-4 border border-gray-700/50 shadow-inner">
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
        <div key={item.key} className="glass-panel p-3 flex flex-col gap-2 group hover:border-primary-500/30 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="font-mono text-sm font-medium text-primary-400 break-all">
              {item.key}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => handleCopy(item.value, item.key)} className="p-1 hover:bg-navy-700 rounded text-gray-400 hover:text-white transition-colors">
                {copiedKey === item.key ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
              <button onClick={() => handleEdit(item.key, item.value)} className="p-1 hover:bg-navy-700 rounded text-gray-400 hover:text-white transition-colors">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(item.key)} className="p-1 hover:bg-red-900/30 rounded text-gray-400 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          
          <div className="bg-navy-950/50 rounded-md p-2 border border-gray-800/50">
            {editingKey === item.key ? (
              <div className="flex flex-col gap-2">
                <textarea 
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full bg-navy-900 border border-primary-500/50 rounded p-2 text-sm font-mono text-gray-300 focus:outline-none focus:border-primary-500 resize-y min-h-[60px]"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingKey(null)} className="text-xs px-2 py-1 text-gray-400 hover:text-white">Cancel</button>
                  <button onClick={() => handleSave(item.key)} className="text-xs px-2 py-1 bg-primary-500 hover:bg-primary-400 text-white rounded">Save</button>
                </div>
              </div>
            ) : (
              <div className="font-mono text-xs text-gray-300 break-all max-h-32 overflow-y-auto custom-scrollbar">
                {item.value}
              </div>
            )}
          </div>
          
          <div className="flex justify-end text-[10px] text-gray-500 font-medium tracking-wide uppercase">
            {formatBytes(item.size)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StorageTable;
