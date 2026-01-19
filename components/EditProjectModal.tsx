
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { summarizeWork } from '../services/geminiService';

interface EditProjectModalProps {
  project: Project | Partial<Project>;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
  isNew?: boolean;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onSave, isNew }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    longDescription: '',
    tags: [],
    imageUrls: [],
    links: { github: '', demo: '' },
    ...project
  });
  
  const [tagsString, setTagsString] = useState(formData.tags?.join(', ') || '');
  const [imageUrls, setImageUrls] = useState<string[]>(formData.imageUrls || ['']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [assetStatus, setAssetStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Reliable Google Drive Direct View Conversion
  const convertDriveLink = (url: string): string => {
    if (!url) return url;
    
    let fileId = null;
    const driveRegex = /(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/file\/d\/|drive\.google\.com\/uc\?export=view&id=)([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match) fileId = match[1];
    
    if (!fileId && url.includes('id=')) {
      const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch) fileId = idMatch[1];
    }
    
    // Thumbnail Endpoint is far more reliable for <img> tags as it bypasses the "too large to scan" page.
    return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200` : url;
  };

  useEffect(() => {
    const currentUrl = imageUrls[focusedIndex];
    if (currentUrl && currentUrl.trim() !== '') {
      setAssetStatus('validating');
    } else {
      setAssetStatus('idle');
    }
  }, [imageUrls, focusedIndex]);

  const handleAiSummarize = async () => {
    if (!formData.title) {
      alert("Please provide a title first so the AI knows what to summarize.");
      return;
    }
    
    setIsAiLoading(true);
    try {
      const summary = await summarizeWork(
        formData.title || '', 
        tagsString.split(',').map(t => t.trim()).filter(t => t !== ''), 
        formData.description || ''
      );
      
      if (summary) {
        setFormData(prev => ({ ...prev, description: summary }));
      }
    } catch (err) {
      console.error("Summarization failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddImageUrl = () => {
    const newUrls = [...imageUrls, ''];
    setImageUrls(newUrls);
    setFocusedIndex(newUrls.length - 1);
  };

  const handleRemoveImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    const updatedUrls = newUrls.length > 0 ? newUrls : [''];
    setImageUrls(updatedUrls);
    setFocusedIndex(Math.max(0, index - 1));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = convertDriveLink(value.trim());
    setImageUrls(newUrls);
    setFocusedIndex(index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProject = {
      ...formData,
      id: formData.id || `p${Date.now()}`,
      tags: tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      imageUrls: imageUrls.filter(url => url.trim() !== ''),
      links: formData.links || { github: '', demo: '' }
    } as Project;
    onSave(finalProject);
  };

  const currentPreviewUrl = imageUrls[focusedIndex];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/95 backdrop-blur-md">
      <div className="w-full max-w-2xl glass rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10 max-h-[90vh] flex flex-col text-white">
        {/* Header */}
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isNew ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isNew ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />}
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold">{isNew ? 'Creative Director' : 'Curator'}</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {isNew ? 'New Collection Asset' : 'Refining Work Archive'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
               <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Live Asset Monitor</label>
               {assetStatus !== 'idle' && (
                 <span className={`text-[8px] font-bold uppercase px-3 py-1 rounded-full border transition-all duration-300 ${
                   assetStatus === 'valid' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                   assetStatus === 'invalid' ? 'text-red-400 border-red-400/20 bg-red-400/5' :
                   'text-blue-400 border-blue-400/20 bg-blue-400/5'
                 }`}>
                   {assetStatus === 'valid' ? 'Verified' : assetStatus === 'invalid' ? 'Asset Err' : 'Scanning...'}
                 </span>
               )}
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black/80 border border-white/10 flex items-center justify-center group/mon">
               {currentPreviewUrl && currentPreviewUrl.trim() !== '' ? (
                 <>
                   {assetStatus !== 'invalid' && (
                     <img 
                       key={currentPreviewUrl}
                       src={currentPreviewUrl} 
                       alt="" 
                       referrerPolicy="no-referrer"
                       className={`w-full h-full object-cover transition-all duration-700 ${assetStatus === 'valid' ? 'opacity-100' : 'opacity-0'}`} 
                       onLoad={() => setAssetStatus('valid')}
                       onError={() => setAssetStatus('invalid')}
                     />
                   )}
                   {assetStatus === 'validating' && (
                     <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
                   )}
                   {assetStatus === 'invalid' && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gray-900">
                        <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-4"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center">Restricted Asset or Invalid Link</p>
                        <p className="text-[8px] text-red-400/60 uppercase tracking-widest mt-2 text-center px-6">Ensure Drive permissions are set to 'Anyone with the link'</p>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="text-center opacity-20"><svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
               )}
               <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-lg border border-white/10 text-[8px] font-bold text-white uppercase tracking-widest backdrop-blur-md">Slot {focusedIndex + 1} Buffer</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Work Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs transition-all" placeholder="Project Name..." />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Expertise Tags</label>
              <input type="text" value={tagsString} onChange={(e) => setTagsString(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs transition-all" placeholder="UI, UX, Motion..." />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Narrative Summary</label>
              <button 
                type="button" 
                onClick={handleAiSummarize}
                disabled={isAiLoading || !formData.title}
                className={`flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest transition-all group ${isAiLoading ? 'text-blue-400' : 'text-emerald-400 hover:text-white'} disabled:opacity-30`}
              >
                {isAiLoading ? 'Synthesizing...' : 'AI Magic Summarize'}
                <svg className={`h-3 w-3 ${isAiLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs transition-all" placeholder="Brief overview of the creative problem solved..." />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Asset Registry</label>
              <button type="button" onClick={handleAddImageUrl} className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20 hover:bg-emerald-400 hover:text-white transition-all">+ Register New Link</button>
            </div>
            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em] px-2 italic">Tip: Paste your Drive Sharing Link. We'll optimize it automatically.</p>
            <div className="space-y-3">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex gap-2">
                  <input type="text" value={url} onFocus={() => setFocusedIndex(idx)} onChange={(e) => handleImageUrlChange(idx, e.target.value)} className={`flex-1 bg-white/5 border ${focusedIndex === idx ? 'border-emerald-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-[9px] font-mono text-white transition-all`} placeholder="Paste Drive Sharing Link..." />
                  <button type="button" onClick={() => handleRemoveImageUrl(idx)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">View Project URL (Demo)</label><input type="text" value={formData.links?.demo} onChange={(e) => setFormData({ ...formData, links: { ...formData.links!, demo: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[9px] text-white" placeholder="https://..." /></div>
            <div className="space-y-2"><label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Source / Case Study URL</label><input type="text" value={formData.links?.github} onChange={(e) => setFormData({ ...formData, links: { ...formData.links!, github: e.target.value } })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[9px] text-white" placeholder="GitHub/Behance..." /></div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all">Discard</button>
            <button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20">Commit to Archive</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
