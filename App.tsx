
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import ChatWidget from './components/ChatWidget.tsx';
import LoginModal from './components/LoginModal.tsx';
import EditProjectModal from './components/EditProjectModal.tsx';
import EditProfileModal from './components/EditProfileModal.tsx';
import ProjectPreviewModal from './components/ProjectPreviewModal.tsx';
import { PORTFOLIO_DATA } from './constants.ts';
import { Project, PortfolioData } from './types.ts';

// Helper to ensure Google Drive links are in the most reliable "Thumbnail" format
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

  return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200` : url;
};

const SmartImage: React.FC<{ 
  src: string; 
  alt: string; 
  className?: string; 
  fallbackInitials?: string;
  loading?: "lazy" | "eager";
}> = ({ src, alt, className, fallbackInitials, loading = "lazy" }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const correctedSrc = convertDriveLink(src);

  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [src]);

  if (error || !correctedSrc) {
    return (
      <div className={`${className} bg-gradient-to-br from-blue-600/10 to-indigo-600/10 flex items-center justify-center border border-white/5`}>
        <span className="text-4xl font-heading font-bold text-white/10 select-none">
          {fallbackInitials || alt.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={correctedSrc} 
      alt={alt} 
      referrerPolicy="no-referrer"
      className={`${className} transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      onLoad={() => setLoaded(true)}
      onError={() => {
        console.error("Image asset failed to resolve:", correctedSrc);
        setError(true);
      }}
      loading={loading}
    />
  );
};

const ProjectCard: React.FC<{ 
  project: Project; 
  isAdmin: boolean; 
  onEdit: (p: Project) => void; 
  onPreview: (p: Project) => void; 
}> = ({ project, isAdmin, onEdit, onPreview }) => {
  return (
    <div 
      className="group relative bg-[#0a0a0a] rounded-[40px] overflow-hidden border border-white/[0.03] transition-all duration-700 hover:border-blue-500/20 flex flex-col h-full cursor-pointer hover-lift shadow-2xl"
      onClick={() => onPreview(project)}
    >
      {isAdmin && (
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(project); }}
          className="absolute top-8 right-8 z-40 bg-blue-600 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-2xl"
        >
          Modify
        </button>
      )}

      <div className="relative aspect-[4/3] overflow-hidden bg-[#0d0d0d]">
        <SmartImage 
          src={project.imageUrls[0]} 
          alt={project.title} 
          className="w-full h-full object-cover scale-[1.05] group-hover:scale-100 grayscale-[40%] group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90 group-hover:opacity-40 transition-opacity duration-700"></div>
        
        <div className="absolute bottom-8 left-8 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
          {project.tags.slice(0, 1).map(tag => (
            <span key={tag} className="px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-10 flex-1 flex flex-col">
        <h3 className="text-3xl font-heading font-bold text-white mb-4 tracking-tighter group-hover:text-blue-400 transition-colors duration-500">
          {project.title}
        </h3>
        
        <p className="text-base text-white/30 leading-relaxed font-light line-clamp-2 mb-10 group-hover:text-white/50 transition-colors duration-500">
          {project.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between text-[10px] font-black uppercase tracking-[0.4em] text-white/10 group-hover:text-white transition-all duration-700">
          <span>Case Narrative</span>
          <div className="w-8 h-px bg-white/10 group-hover:w-20 group-hover:bg-blue-500 transition-all duration-700"></div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [initialTags, setInitialTags] = useState<string[]>([]);
  const [data, setData] = useState<PortfolioData>(PORTFOLIO_DATA);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pp_portfolio_v10');
      if (saved) setData(JSON.parse(saved));
      const adminSession = localStorage.getItem('pp_admin');
      if (adminSession === 'true') setIsAdmin(true);
    } catch (e) {
      console.error("Storage load error", e);
    }
  }, []);

  const handleLogin = (password: string) => {
    if (password === (localStorage.getItem('pp_admin_key') || 'admin123')) {
      setIsAdmin(true);
      setShowLogin(false);
      localStorage.setItem('pp_admin', 'true');
      return true;
    }
    return false;
  };

  const handleQuickAdd = (type: 'PRODUCT' | 'IDENTITY') => {
    setInitialTags(type === 'PRODUCT' ? ['UI/UX', 'Mobile'] : ['Graphic Design', 'Branding']);
    setIsAddingProject(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('pp_admin');
  };

  const handleSaveProject = (p: Project) => {
    const newProjects = isAddingProject ? [...data.projects, p] : data.projects.map(item => item.id === p.id ? p : item);
    const newData = { ...data, projects: newProjects };
    setData(newData);
    localStorage.setItem('pp_portfolio_v10', JSON.stringify(newData));
    setEditingProject(null);
    setIsAddingProject(false);
    setInitialTags([]);
  };

  const persistProfile = (newData: PortfolioData) => {
    setData(newData);
    localStorage.setItem('pp_portfolio_v10', JSON.stringify(newData));
  };

  const graphicProjects = data.projects.filter(p => p.tags.some(t => ['Graphic Design', 'Branding'].includes(t)));
  const uiProjects = data.projects.filter(p => !graphicProjects.includes(p));

  const initials = data.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 overflow-hidden font-sans">
      <Navbar 
        isAdmin={isAdmin} 
        onLogout={handleLogout} 
        onLoginClick={() => setShowLogin(true)} 
        onEditProfile={() => setShowProfileEdit(true)} 
        resumeUrl={data.resumeUrl}
      />
      
      <main className="relative z-10 w-full">
        <Hero data={data} />

        <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24">
          
          <section id="about" className="py-40 md:py-60 border-t border-white/5">
            <div className="grid lg:grid-cols-12 gap-24 items-start">
              <div className="lg:col-span-5 relative">
                 <div className="aspect-[4/5] rounded-[48px] overflow-hidden glass-premium p-4 shadow-2xl bg-[#0a0a0a]">
                    <SmartImage 
                      src={data.profileImage} 
                      alt={data.name} 
                      className="w-full h-full object-cover rounded-[36px] grayscale hover:grayscale-0 ease-out hover:scale-105"
                      fallbackInitials={initials}
                      loading="eager"
                    />
                 </div>
                 
                 <div className="absolute -bottom-10 -right-10 glass-premium p-10 rounded-[40px] shadow-2xl border border-white/10 hidden xl:block">
                    <div className="flex gap-12">
                       <div>
                          <div className="text-5xl font-heading font-bold text-blue-500 mb-1">{data.yearsExperience}</div>
                          <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Mastery</div>
                       </div>
                       <div>
                          <div className="text-5xl font-heading font-bold text-white mb-1">{data.projects.length}</div>
                          <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Assets</div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-7 lg:pl-12">
                 <p className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 mb-12 flex items-center gap-6">
                   <span className="h-px w-12 bg-blue-500"></span> Identity & Vision
                 </p>
                 <h2 className="text-7xl md:text-8xl font-heading font-bold text-white tracking-tighter mb-14 leading-[0.9]">{data.aboutHeadline}</h2>
                 
                 <div className="space-y-10 mb-20">
                    <p className="text-2xl md:text-3xl text-white/60 leading-relaxed font-light text-balance">
                      {data.about}
                    </p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-16 border-t border-white/5">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Philosophy</h4>
                       <p className="text-sm text-white/30 leading-relaxed font-light">
                          I believe digital interfaces are the modern canvas for human connection. My approach blends rigorous logic with emotional resonance.
                       </p>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Objective</h4>
                       <p className="text-sm text-white/30 leading-relaxed font-light">
                          To architect platforms that don't just solve problems, but inspire a sense of wonder and effortless utility.
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          </section>

          <section id="projects" className="py-40 md:py-60 border-t border-white/5">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16 mb-40">
              <div className="max-w-3xl">
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 mb-10 flex items-center gap-6">
                  <span className="h-px w-12 bg-blue-500"></span> Selected Output
                </p>
                <h2 className="text-7xl md:text-9xl font-heading font-bold tracking-tighter text-white mb-12 leading-[0.85]">
                  Visual <span className="text-white/20 italic">Intelligence.</span>
                </h2>
                <p className="text-white/40 font-light text-2xl leading-relaxed max-w-2xl">
                  Curated case studies focusing on high-frequency interfaces and sophisticated brand narratives.
                </p>
              </div>
              {isAdmin && (
                <div className="flex gap-4">
                  <button onClick={() => { setInitialTags(['UI/UX', 'Mobile']); setIsAddingProject(true); }} className="px-8 py-5 glass-premium text-blue-400 border-blue-500/20 hover:bg-blue-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all shadow-2xl">
                    + Product System
                  </button>
                  <button onClick={() => { setInitialTags(['Graphic Design', 'Branding']); setIsAddingProject(true); }} className="px-8 py-5 glass-premium text-emerald-400 border-emerald-500/20 hover:bg-emerald-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all shadow-2xl">
                    + Identity Asset
                  </button>
                </div>
              )}
            </div>

            <div className="mb-60">
              <div className="flex items-center gap-10 mb-24">
                 <span className="text-6xl md:text-8xl font-heading font-bold text-white/5">01</span>
                 <h3 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tighter">Product Systems</h3>
                 <div className="h-px flex-1 bg-white/5"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {uiProjects.map((p) => (
                  <ProjectCard 
                    key={p.id} 
                    project={p} 
                    isAdmin={isAdmin} 
                    onEdit={setEditingProject} 
                    onPreview={setPreviewProject} 
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-10 mb-24">
                 <span className="text-6xl md:text-8xl font-heading font-bold text-white/5">02</span>
                 <h3 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tighter">Identity Design</h3>
                 <div className="h-px flex-1 bg-white/5"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {graphicProjects.map((p) => (
                  <ProjectCard 
                    key={p.id} 
                    project={p} 
                    isAdmin={isAdmin} 
                    onEdit={setEditingProject} 
                    onPreview={setPreviewProject} 
                  />
                ))}
              </div>
            </div>
          </section>

          <section id="experience" className="py-40 md:py-60 border-t border-white/5">
            <div className="grid lg:grid-cols-12 gap-32">
              <div className="lg:col-span-5 sticky top-40 h-fit">
                 <p className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 mb-10 flex items-center gap-6">
                   <span className="h-px w-12 bg-blue-500"></span> Career Path
                 </p>
                 <h2 className="text-7xl font-heading font-bold tracking-tighter text-white mb-12 leading-[0.85]">Strategic <br/><span className="text-white/20 italic">Evolution.</span></h2>
                 <p className="text-white/40 text-xl leading-relaxed max-w-sm">
                   A record of professional impact within global design ecosystems.
                 </p>
              </div>
              
              <div className="lg:col-span-7 space-y-32 relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5 md:left-[-60px]"></div>
                {data.experience.map((exp, index) => (
                  <div key={index} className="relative group">
                    <div className="hidden md:block absolute left-[-64.5px] top-3 w-2.5 h-2.5 rounded-full bg-white/10 group-hover:bg-blue-500 transition-all duration-700 shadow-2xl"></div>
                    
                    <div className="space-y-8">
                       <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400/60 font-mono">
                          {exp.period}
                       </span>
                       <h3 className="text-5xl font-heading font-bold text-white mb-2 group-hover:translate-x-4 transition-transform duration-700 leading-tight">{exp.role}</h3>
                       <p className="text-2xl font-bold text-white/50 mb-10">{exp.company}</p>
                       <div className="space-y-6 max-w-xl">
                         {exp.description.map((desc, i) => (
                           <div key={i} className="flex gap-6 items-start text-white/40 text-lg leading-relaxed font-light">
                             <span className="mt-3.5 w-1.5 h-1.5 rounded-full bg-white/10 flex-shrink-0"></span>
                             <p>{desc}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="skills" className="py-40 md:py-60 border-t border-white/5">
             <div className="grid lg:grid-cols-12 gap-32">
                <div className="lg:col-span-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 mb-10 flex items-center gap-6">
                     <span className="h-px w-12 bg-blue-500"></span> Core Stack
                   </p>
                   <h2 className="text-7xl font-heading font-bold tracking-tighter text-white leading-[0.85]">Technical <br/><span className="text-white/20 italic">Arsenal.</span></h2>
                </div>

                <div className="lg:col-span-8 grid md:grid-cols-2 gap-10">
                   {data.skills.map((skillGroup, index) => (
                     <div key={index} className="glass-premium p-14 rounded-[48px] hover:border-white/20 transition-all duration-700 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 text-8xl font-heading font-bold text-white/[0.02] group-hover:text-white/[0.04] transition-all">0{index+1}</div>
                        <h3 className="text-3xl font-heading font-bold text-white mb-12 border-b border-white/10 pb-8 inline-block pr-16">{skillGroup.category}</h3>
                        <div className="flex flex-wrap gap-4">
                          {skillGroup.items.map((item, i) => (
                            <span key={i} className="px-5 py-2.5 bg-white/[0.03] text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl border border-white/[0.05] hover:border-blue-500/40 hover:text-white transition-all cursor-default">
                              {item}
                            </span>
                          ))}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </section>

          <section id="contact" className="py-40 md:py-60 border-t border-white/5 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[180px] pointer-events-none"></div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.8em] text-blue-500 mb-16">Engagement Protocol</p>
            <h2 className="text-7xl md:text-[10vw] font-heading font-bold tracking-tighter text-white mb-24 leading-[0.8]">
              Let's craft <br/> the <span className="text-white/20 italic">impossible.</span>
            </h2>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-10 mb-32">
              <a href={`mailto:${data.email}`} className="px-16 py-7 bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-full hover:scale-110 transition-all duration-500 shadow-[0_25px_60px_rgba(255,255,255,0.15)]">
                Direct Dispatch
              </a>
              <a href={data.resumeUrl} target="_blank" className="px-16 py-7 glass-premium text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-full hover:bg-white/5 transition-all">
                Access Resume
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-10 md:gap-20 pt-32 border-t border-white/5">
              {Object.entries(data.socials).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-all uppercase text-[10px] font-black tracking-[0.6em]">
                  {platform}
                </a>
              ))}
            </div>
            
            <div className="mt-32 text-white/10 text-[9px] font-black uppercase tracking-[1em]">
               © {new Date().getFullYear()} Prabhakar Patnala Systems
            </div>
          </section>
        </div>
      </main>

      <ChatWidget data={data} />
      
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} recoveryEmail="patnalaprabhakar827@gmail.com" onQuickAdd={handleQuickAdd} />}
      {editingProject && <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onSave={handleSaveProject} />}
      {isAddingProject && <EditProjectModal project={{ tags: initialTags }} isNew onClose={() => setIsAddingProject(false)} onSave={handleSaveProject} />}
      {showProfileEdit && <EditProfileModal data={data} onClose={() => setShowProfileEdit(false)} onSave={persistProfile} />}
      {previewProject && <ProjectPreviewModal project={previewProject} onClose={() => setPreviewProject(null)} />}
    </div>
  );
};

export default App;
