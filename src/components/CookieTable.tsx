import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatBytes, removeCookie, setCookie } from '../utils/chrome';
import { Edit2, Trash2, Copy, Check, Globe, Lock, Cookie } from 'lucide-react';

const CookieTable: React.FC = () => {
  const { cookieData, searchQuery, currentUrl, loadData } = useAppStore();
  
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredData = cookieData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (name: string, value: string) => {
    setEditingKey(name);
    setEditValue(value);
  };

  const handleSave = async (cookie: any) => {
    if (!currentUrl) return;
    await setCookie(currentUrl, {
      ...cookie,
      value: editValue
    });
    setEditingKey(null);
    loadData();
  };

  const handleDelete = async (name: string) => {
    if (!currentUrl) return;
    await removeCookie(currentUrl, name);
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
          <Cookie className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-sm font-medium text-gray-400">No cookies found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {filteredData.map((item) => (
        <div key={item.name} className="glass-panel p-3 flex flex-col gap-2 group hover:border-primary-500/30 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 max-w-[70%]">
              <span className="font-mono text-sm font-bold text-accent break-all">{item.name}</span>
              {item.secure && <span title="Secure" className="flex items-center"><Lock size={12} className="text-green-400 shrink-0" /></span>}
              {item.httpOnly && <span title="HttpOnly" className="flex items-center"><Globe size={12} className="text-purple-400 shrink-0" /></span>}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => handleCopy(item.value, item.name)} className="p-1 hover:bg-navy-700 rounded text-gray-400 hover:text-white transition-colors">
                {copiedKey === item.name ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
              <button onClick={() => handleEdit(item.name, item.value)} className="p-1 hover:bg-navy-700 rounded text-gray-400 hover:text-white transition-colors">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(item.name)} className="p-1 hover:bg-red-900/30 rounded text-gray-400 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          
          <div className="bg-navy-950/50 rounded-md p-2 border border-gray-800/50">
            {editingKey === item.name ? (
              <div className="flex flex-col gap-2">
                <textarea 
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full bg-navy-900 border border-primary-500/50 rounded p-2 text-sm font-mono text-gray-300 focus:outline-none focus:border-primary-500 resize-y min-h-[60px]"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingKey(null)} className="text-xs px-2 py-1 text-gray-400 hover:text-white">Cancel</button>
                  <button onClick={() => handleSave(item)} className="text-xs px-2 py-1 bg-primary-500 hover:bg-primary-400 text-white rounded">Save</button>
                </div>
              </div>
            ) : (
              <div className="font-mono text-xs text-gray-300 break-all max-h-32 overflow-y-auto custom-scrollbar">
                {item.value}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
            <div className="flex gap-3">
              <span title="Domain">Domain: {item.domain}</span>
              <span title="Path">Path: {item.path}</span>
            </div>
            <span className="uppercase tracking-wide">{formatBytes(item.size)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CookieTable;
