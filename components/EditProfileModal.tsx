
import React, { useState } from 'react';
import { PortfolioData, Experience, Skill } from '../types';
import { getProfileSuggestions } from '../services/geminiService';

interface EditProfileModalProps {
  data: PortfolioData;
  onClose: () => void;
  onSave: (updatedData: PortfolioData) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ data, onClose, onSave }) => {
  const [formData, setFormData] = useState<PortfolioData>({ ...data });
  const [activeTab, setActiveTab] = useState<'bio' | 'skills' | 'exp' | 'contact'>('bio');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  // Reliable Google Drive Direct View Conversion
  const convertDriveLink = (url: string): string => {
    if (!url) return url;
    
    let fileId = null;
    
    // Support standard IDs, sharing links, and direct uc/view links
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

  const handleAiSuggestion = async (type: 'bio' | 'experience' | 'skills', index?: number) => {
    setIsAiLoading(true);
    setSuggestion(null);
    let result = "";
    
    if (type === 'bio') {
      result = await getProfileSuggestions('bio', formData.about);
    } else if (type === 'experience' && index !== undefined) {
      result = await getProfileSuggestions('experience', formData.experience[index]);
    } else if (type === 'skills' && index !== undefined) {
      result = await getProfileSuggestions('skills', formData.skills[index]);
    }

    setSuggestion(result);
    setIsAiLoading(false);
  };

  const handleAddExperience = () => {
    const newExp: Experience = { company: 'New Company', role: 'Developer', period: '2024 - Present', description: ['New achievement'] };
    setFormData({ ...formData, experience: [newExp, ...formData.experience] });
  };

  const handleUpdateExp = (index: number, field: keyof Experience, value: any) => {
    const newExp = [...formData.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setFormData({ ...formData, experience: newExp });
  };

  const handleAddSkillCategory = () => {
    const newSkill: Skill = { category: 'New Category', items: ['Skill 1'] };
    setFormData({ ...formData, skills: [...formData.skills, newSkill] });
  };

  const handleUpdateSocial = (platform: keyof typeof formData.socials, value: string) => {
    setFormData({
      ...formData,
      socials: {
        ...formData.socials,
        [platform]: value
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 bg-black/95 backdrop-blur-md">
      <div className="w-full max-w-4xl glass rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/20 h-[85vh] flex flex-col text-white">
        {/* Header */}
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold">Command Center</h2>
              <p className="text-xs text-emerald-400 font-bold tracking-widest uppercase opacity-60">Global Portfolio Logic</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-all">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex bg-white/5 border-b border-white/10 px-4">
          <button onClick={() => {setActiveTab('bio'); setSuggestion(null);}} className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'bio' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500 hover:text-white'}`}>Identity</button>
          <button onClick={() => {setActiveTab('exp'); setSuggestion(null);}} className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'exp' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500 hover:text-white'}`}>Timeline</button>
          <button onClick={() => {setActiveTab('skills'); setSuggestion(null);}} className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'skills' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500 hover:text-white'}`}>Skills</button>
          <button onClick={() => {setActiveTab('contact'); setSuggestion(null);}} className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'contact' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500 hover:text-white'}`}>Contact</button>
        </div>

        {/* Suggestion Overlay */}
        {suggestion && (
          <div className="absolute top-36 left-8 right-8 z-30 p-6 bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Proposal Intelligence</span>
              <button onClick={() => setSuggestion(null)} className="text-gray-400 hover:text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed italic mb-6">"{suggestion}"</p>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => {
                  if (activeTab === 'bio') setFormData({...formData, about: suggestion});
                  setSuggestion(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-all"
              >
                Apply Change
              </button>
              <button onClick={() => setSuggestion(null)} className="px-4 py-2 bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-lg">Ignore</button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {activeTab === 'bio' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Professional Tagline</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Biography</label>
                  <button 
                    type="button" 
                    onClick={() => handleAiSuggestion('bio')}
                    disabled={isAiLoading}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-white transition-all group disabled:opacity-50"
                  >
                    {isAiLoading ? 'Analyzing...' : 'AI Enhance Bio'}
                    <svg className={`h-3.5 w-3.5 ${isAiLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 001.414 1.96l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-1.414-1.96l-2.387-.477z" />
                    </svg>
                  </button>
                </div>
                <textarea rows={5} value={formData.about} onChange={(e) => setFormData({...formData, about: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all text-sm leading-relaxed" />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Mastery (Experience)</label>
                  <input type="text" value={formData.yearsExperience} onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all font-mono text-xs" placeholder="e.g. 8+" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Availability Badge</label>
                  <input type="text" value={formData.availabilityStatus} onChange={(e) => setFormData({...formData, availabilityStatus: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Profile Image URL</label>
                  <input 
                    type="text" 
                    value={formData.profileImage} 
                    onChange={(e) => {
                      const inputVal = e.target.value.trim();
                      const optimizedUrl = convertDriveLink(inputVal);
                      setFormData({...formData, profileImage: optimizedUrl});
                    }} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-xs" 
                    placeholder="Paste Drive Link..."
                  />
                </div>
              </div>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-400/5 p-4 rounded-xl border border-emerald-400/10">
                Registry Notice: Set Drive sharing to 'Anyone with the link' and paste the link here. We'll automatically optimize it for public display.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Resume / CV Resource URL</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={formData.resumeUrl} 
                    onChange={(e) => setFormData({...formData, resumeUrl: e.target.value})} 
                    placeholder="Link to PDF, Google Drive, or personal site..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-blue-500 transition-all font-mono text-xs pr-12" 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exp' && (
            <div className="space-y-8">
              <button type="button" onClick={handleAddExperience} className="w-full py-4 border-2 border-dashed border-emerald-500/20 text-emerald-400 rounded-2xl hover:bg-emerald-500/10 transition-all font-bold text-sm tracking-widest uppercase">
                + Append History Node
              </button>
              {formData.experience.map((exp, idx) => (
                <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-6 relative group">
                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => handleAiSuggestion('experience', idx)}
                      disabled={isAiLoading}
                      className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-full transition-all disabled:opacity-50"
                      title="Suggest Achievements"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </button>
                    <button type="button" onClick={() => setFormData({...formData, experience: formData.experience.filter((_, i) => i !== idx)})} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Company</label>
                      <input type="text" value={exp.company} onChange={(e) => handleUpdateExp(idx, 'company', e.target.value)} className="w-full bg-transparent border-b border-white/10 py-1 text-white font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Role</label>
                      <input type="text" value={exp.role} onChange={(e) => handleUpdateExp(idx, 'role', e.target.value)} className="w-full bg-transparent border-b border-white/10 py-1 text-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Period</label>
                      <input type="text" value={exp.period} onChange={(e) => handleUpdateExp(idx, 'period', e.target.value)} className="w-full bg-transparent border-b border-white/10 py-1 text-blue-400 font-mono text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Achievements (Newline separated)</label>
                    <textarea value={exp.description.join('\n')} onChange={(e) => handleUpdateExp(idx, 'description', e.target.value.split('\n'))} className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs text-gray-400" rows={3} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-8">
              <button type="button" onClick={handleAddSkillCategory} className="w-full py-4 border-2 border-dashed border-emerald-500/20 text-emerald-400 rounded-2xl hover:bg-emerald-500/10 transition-all font-bold text-sm tracking-widest uppercase">
                + Register Skill Module
              </button>
              <div className="grid md:grid-cols-2 gap-6">
                {formData.skills.map((skill, idx) => (
                  <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 relative group">
                    <div className="flex justify-between items-center">
                      <input type="text" value={skill.category} onChange={(e) => {
                        const newSkills = [...formData.skills];
                        newSkills[idx].category = e.target.value;
                        setFormData({...formData, skills: newSkills});
                      }} className="bg-transparent border-b border-emerald-500/30 text-emerald-400 font-bold text-lg" />
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => handleAiSuggestion('skills', idx)}
                          className="text-emerald-500/40 hover:text-emerald-400 transition-all"
                          title="Suggest Skills"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </button>
                        <button type="button" onClick={() => setFormData({...formData, skills: formData.skills.filter((_, i) => i !== idx)})} className="text-red-500/40 hover:text-red-500 p-1">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                    <textarea value={skill.items.join(', ')} onChange={(e) => {
                      const newSkills = [...formData.skills];
                      newSkills[idx].items = e.target.value.split(',').map(s => s.trim());
                      setFormData({...formData, skills: newSkills});
                    }} className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-xs text-gray-300 min-h-[100px]" placeholder="Skill 1, Skill 2, etc..." />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Official Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Direct Phone</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-xs" />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.5em] border-b border-white/5 pb-4">Social Ecosystem</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">GitHub</label>
                    <input type="text" value={formData.socials.github} onChange={(e) => handleUpdateSocial('github', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-[10px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">LinkedIn</label>
                    <input type="text" value={formData.socials.linkedin} onChange={(e) => handleUpdateSocial('linkedin', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-[10px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Instagram</label>
                    <input type="text" value={formData.socials.instagram} onChange={(e) => handleUpdateSocial('instagram', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-[10px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Behance</label>
                    <input type="text" value={formData.socials.behance} onChange={(e) => handleUpdateSocial('behance', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-[10px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Dribbble</label>
                    <input type="text" value={formData.socials.dribbble} onChange={(e) => handleUpdateSocial('dribbble', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-[10px]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-white/10 bg-white/5 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 bg-white/5 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs border border-white/5">Cancel</button>
          <button type="button" onClick={handleSubmit} className="flex-[2] bg-emerald-600 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-2xl shadow-emerald-500/30 hover:bg-emerald-500 transform active:scale-95 transition-all">Apply Global State</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
