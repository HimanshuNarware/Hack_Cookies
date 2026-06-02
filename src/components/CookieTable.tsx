import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatBytes, removeCookie, setCookie } from '../utils/chrome';
import { Edit2, Trash2, Copy, Check, Globe, Cookie } from 'lucide-react';

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
        <div className="w-16 h-16 bg-charcoal rounded-full flex items-center justify-center mb-4 border border-charcoal/50 shadow-inner">
          <Cookie className="w-8 h-8 opacity-50 text-sky-blue" />
        </div>
        <p className="text-sm font-medium text-gray-400">No cookies found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {filteredData.map((item) => (
        <div key={item.name} className="glass-panel p-4 flex flex-col gap-3 group hover:border-sky-blue/30 transition-colors relative overflow-hidden">
          {/* Subtle indicator bar for item type */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-blue/80"></div>
          
          <div className="flex items-start justify-between gap-2 pl-2">
            <div className="flex items-center gap-2 max-w-[70%]">
              <span className="font-mono text-sm font-bold text-sky-blue break-all">{item.name}</span>
              {item.secure && <span title="Secure" className="flex items-center px-2 py-0.5 rounded-full bg-neon-lime text-[9px] font-bold tracking-wider uppercase text-obsidian-deep shrink-0">Secure</span>}
              {item.httpOnly && <span title="HttpOnly" className="flex items-center px-2 py-0.5 rounded-full bg-kinetic-amber text-[9px] font-bold tracking-wider uppercase text-obsidian-deep shrink-0">HttpOnly</span>}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => handleCopy(item.value, item.name)} className="p-1.5 hover:bg-obsidian-deep rounded-full text-gray-400 hover:text-sky-blue transition-colors">
                {copiedKey === item.name ? <Check size={14} className="text-neon-lime" /> : <Copy size={14} />}
              </button>
              <button onClick={() => handleEdit(item.name, item.value)} className="p-1.5 hover:bg-obsidian-deep rounded-full text-gray-400 hover:text-sky-blue transition-colors">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(item.name)} className="p-1.5 hover:bg-red-900/30 rounded-full text-gray-400 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          
          <div className="bg-obsidian-deep rounded-xl p-3 border border-charcoal/50 ml-2">
            {editingKey === item.name ? (
              <div className="flex flex-col gap-2">
                <textarea 
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="input-field resize-y min-h-[60px] rounded-xl"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditingKey(null)} className="text-xs px-3 py-1.5 text-gray-400 hover:text-pure-white rounded-full hover:bg-charcoal transition-colors">Cancel</button>
                  <button onClick={() => handleSave(item)} className="text-xs px-4 py-1.5 bg-sky-blue hover:bg-sky-blue/90 text-obsidian-deep font-bold rounded-full transition-colors shadow-[0_0_10px_rgba(92,197,242,0.2)]">Save</button>
                </div>
              </div>
            ) : (
              <div className="font-mono text-xs font-medium text-pure-white/90 break-all max-h-32 overflow-y-auto custom-scrollbar">
                {item.value}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold tracking-wider uppercase ml-2">
            <div className="flex gap-3">
              <span title="Domain" className="flex items-center gap-1"><Globe size={10} className="text-gray-600" /> {item.domain}</span>
              <span title="Path">Path: {item.path}</span>
            </div>
            <span>{formatBytes(item.size)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CookieTable;
