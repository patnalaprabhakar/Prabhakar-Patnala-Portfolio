
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ChatWidget from './components/ChatWidget';
import LoginModal from './components/LoginModal';
import EditProjectModal from './components/EditProjectModal';
import EditProfileModal from './components/EditProfileModal';
import ProjectPreviewModal from './components/ProjectPreviewModal';
import { PORTFOLIO_DATA } from './constants';
import { Project, PortfolioData } from './types';

const ProjectCard: React.FC<{ 
  project: Project; 
  isAdmin: boolean; 
  onEdit: (p: Project) => void; 
  onPreview: (p: Project) => void; 
}> = ({ project, isAdmin, onEdit, onPreview }) => {
  const ensureAbsoluteUrl = (url?: string) => {
    if (!url || url === '#') return '#';
    if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
    return `https://${url}`;
  };

  const hasDemo = project.links.demo && project.links.demo !== '#';

  return (
    <div className="group relative bg-white/[0.02] rounded-[2rem] overflow-hidden border border-white/[0.05] transition-all duration-500 flex flex-col h-full bento-card glass inner-glow">
      {isAdmin && (
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(project); }}
          className="absolute top-6 right-6 z-40 bg-blue-600 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-wider shadow-2xl border border-white/20"
        >
          Curate
        </button>
      )}

      <div 
        className="relative aspect-[16/10] overflow-hidden bg-black cursor-pointer"
        onClick={() => onPreview(project)}
      >
        <img 
          src={project.imageUrls[0] || 'https://via.placeholder.com/800x600'} 
          alt={project.title} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-all duration-1000 ease-in-out group-hover:scale-110 group-hover:rotate-1"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-blue-600/10 backdrop-blur-[2px]">
           <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-black shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
           </div>
        </div>
      </div>

      <div className="p-8 md:p-10 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-6">
           {project.tags.slice(0, 3).map(tag => (
             <span key={tag} className="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/5 rounded-full text-blue-400 border border-white/5">{tag}</span>
           ))}
        </div>
        <h3 className="text-2xl font-heading font-bold mb-3 text-white tracking-tight group-hover:text-blue-400 transition-colors leading-tight">{project.title}</h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-8 line-clamp-3 font-light opacity-80">{project.description}</p>
        
        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
           <button 
             onClick={() => onPreview(project)}
             className="text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-4 text-gray-500 hover:text-white transition-all group/btn"
           >
              <span>Explore</span>
              <div className="h-[1px] w-8 bg-white/10 group-hover/btn:w-14 group-hover/btn:bg-blue-500 transition-all duration-500"></div>
           </button>

           {hasDemo && (
             <a 
               href={ensureAbsoluteUrl(project.links.demo)}
               target="_blank"
               rel="noopener noreferrer"
               className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/50 transition-all"
               onClick={(e) => e.stopPropagation()}
             >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
             </a>
           )}
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
  const [data, setData] = useState<PortfolioData>(PORTFOLIO_DATA);

  useEffect(() => {
    const saved = localStorage.getItem('pp_portfolio_v5');
    if (saved) setData(JSON.parse(saved));
    const adminSession = localStorage.getItem('pp_admin');
    if (adminSession === 'true') setIsAdmin(true);
  }, []);

  const handleLogin = (password: string) => {
    const storedPassword = localStorage.getItem('pp_admin_key') || 'admin123';
    if (password === storedPassword) {
      setIsAdmin(true);
      setShowLogin(false);
      localStorage.setItem('pp_admin', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('pp_admin');
  };

  const persistData = (newData: PortfolioData) => {
    setData(newData);
    localStorage.setItem('pp_portfolio_v5', JSON.stringify(newData));
  };

  const handleSaveProject = (updatedProject: Project) => {
    if (isAddingProject) {
      persistData({ ...data, projects: [...data.projects, updatedProject] });
      setIsAddingProject(false);
    } else {
      const newProjects = data.projects.map(p => p.id === updatedProject.id ? updatedProject : p);
      persistData({ ...data, projects: newProjects });
      setEditingProject(null);
    }
  };

  const renderWorkGrid = (projects: Project[], title: string) => (
    <div className="mb-32 last:mb-0">
      <div className="flex items-center gap-8 mb-12">
        <h3 className="text-sm font-heading font-bold text-white/30 tracking-[0.5em] uppercase">{title}</h3>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
        {isAdmin && (
           <button onClick={() => setIsAddingProject(true)} className="px-6 py-2.5 glass text-gray-400 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-500/20 shadow-xl transition-all">+ New Entry</button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} isAdmin={isAdmin} onEdit={setEditingProject} onPreview={setPreviewProject} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030304] text-white selection:bg-blue-600 pb-32">
      <Navbar 
        isAdmin={isAdmin} 
        onLogout={handleLogout} 
        onLoginClick={() => setShowLogin(true)} 
        onEditProfile={() => setShowProfileEdit(true)} 
        resumeUrl={data.resumeUrl}
      />
      
      <main className="max-w-[1440px] mx-auto px-6 md:px-12">
        <Hero isAdmin={isAdmin} onEdit={() => setShowProfileEdit(true)} data={data} />

        {/* REFINED BENTO GRID ABOUT SECTION - 4/8 4/4/4 Pattern */}
        <section id="about" className="py-24 scroll-mt-32">
          <div className="grid lg:grid-cols-12 lg:grid-rows-2 gap-6 max-w-7xl mx-auto">
            
            {/* Box 1: Profile Image - Left Column */}
            <div className="lg:col-span-4 lg:row-span-2 glass rounded-[3rem] overflow-hidden relative min-h-[450px] bento-card shadow-2xl border-white/10">
              <img 
                src={data.profileImage} 
                alt={data.name} 
                className="w-full h-full object-cover grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>
              <div className="absolute bottom-10 left-10">
                 <p className="label-luxury text-blue-500 mb-2 text-[8px] tracking-[0.5em]">Mastermind</p>
                 <p className="text-3xl font-bold text-white tracking-tighter font-heading leading-none">{data.name}</p>
                 <div className="h-[2px] w-8 bg-blue-500 mt-4 opacity-80"></div>
              </div>
            </div>

            {/* Box 2: Identity Synopsis - Top Right Wide Box */}
            <div className="lg:col-span-8 lg:row-span-1 glass rounded-[3rem] p-10 md:p-16 flex flex-col justify-center relative overflow-hidden bento-card border-white/10 group">
              <div className="absolute -top-10 -right-10 text-[12rem] font-black text-white/[0.01] pointer-events-none select-none font-heading group-hover:text-blue-500/[0.03] transition-all duration-1000 uppercase">Soul</div>
              <div className="relative z-10">
                <span className="text-[12px] font-black uppercase tracking-[0.6em] text-blue-500 mb-8 block">Identity Synopsis</span>
                <p className="text-gray-300 text-lg md:text-2xl leading-relaxed font-light max-w-4xl tracking-tight opacity-90">
                  {data.about}
                </p>
              </div>
            </div>

            {/* Box 3: Elite Years - Bottom Row Left */}
            <div className="lg:col-span-4 lg:row-span-1 glass rounded-[3rem] p-10 md:p-14 flex items-center bento-card border-white/10 hover:border-blue-500/30 transition-all group">
              <div className="flex flex-col">
                 <div className="text-6xl md:text-7xl font-heading font-bold text-blue-500 leading-none tracking-tighter group-hover:scale-110 transition-transform duration-500 origin-left">{data.yearsExperience}</div>
                 <div className="label-luxury opacity-40 text-[9px] mt-4 tracking-[0.5em]">Elite Years</div>
              </div>
            </div>

            {/* Box 4: Archive Count - Bottom Row Right */}
            <div className="lg:col-span-4 lg:row-span-1 glass rounded-[3rem] p-10 md:p-14 flex items-center bento-card border-white/10 hover:border-white/20 transition-all group">
              <div className="flex flex-col">
                 <div className="text-6xl md:text-7xl font-heading font-bold text-white leading-none tracking-tighter group-hover:scale-110 transition-transform duration-500 origin-left">{data.projects.length}</div>
                 <div className="label-luxury text-emerald-500/60 mt-4 text-[9px] tracking-[0.5em]">Archive Count</div>
              </div>
            </div>

          </div>
        </section>

        {/* WORK SECTION */}
        <section id="projects" className="py-24 scroll-mt-32">
          <div className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-2xl">
              <p className="label-luxury text-blue-500 mb-6 tracking-[1em] text-[10px]">Selected Projects</p>
              <h2 className="text-5xl md:text-7xl font-heading font-bold tracking-tighter text-white leading-[0.9] mb-6">Archive<span className="text-blue-500">.</span></h2>
              <div className="w-20 h-[2px] bg-blue-500/30"></div>
            </div>
          </div>

          {/* Filtering UI/UX work for the UI/UX projects section */}
          {renderWorkGrid(data.projects.filter(p => p.tags.some(t => t.toUpperCase().includes('UI') || t.toUpperCase().includes('UX'))), "Ui/UX projects")}
          
          {/* Filtering other work for the Graphic design projects section */}
          {renderWorkGrid(data.projects.filter(p => !p.tags.some(t => t.toUpperCase().includes('UI') || t.toUpperCase().includes('UX'))), "Graphic design projects")}
        </section>

        {/* TIMELINE SECTION */}
        <section id="experience" className="py-24 scroll-mt-32">
          <div className="max-w-5xl mx-auto">
            <div className="mb-20 text-center">
              <p className="label-luxury text-blue-500 mb-6 text-[12px] tracking-[0.8em]">Historical Progression</p>
              <h2 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-white mb-4">Journey</h2>
            </div>
            <div className="space-y-10">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="group glass p-10 md:p-16 rounded-[3.5rem] border-white/5 bento-card hover:border-blue-500/20 transition-all duration-700">
                  <div className="flex flex-col md:flex-row gap-12 justify-between">
                    <div className="max-w-md">
                      <p className="label-luxury text-blue-500 mb-5 text-[12px] tracking-[0.5em]">{exp.period}</p>
                      <h3 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 tracking-tight leading-tight group-hover:text-blue-400 transition-colors">{exp.role}</h3>
                      <p className="label-luxury opacity-40 text-[11px] tracking-[0.4em]">{exp.company}</p>
                    </div>
                    <div className="flex-1 max-w-xl">
                      <ul className="space-y-6">
                        {exp.description.map((d, i) => (
                          <li key={i} className="text-gray-400 text-sm md:text-xl leading-relaxed flex items-start gap-6 opacity-80 group-hover:opacity-100 transition-opacity">
                            <span className="mt-3.5 w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="py-24 scroll-mt-32">
          <div className="mb-16 flex items-center gap-12">
             <h2 className="text-5xl md:text-7xl font-heading font-bold tracking-tighter text-white">Expertise.</h2>
             <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
             {data.skills.map((skill, idx) => (
               <div key={idx} className="glass p-10 md:p-14 rounded-[3rem] bento-card border-white/10 hover:border-emerald-500/20">
                  <h3 className="label-luxury mb-10 block opacity-40 text-[10px] tracking-[0.6em] text-emerald-400">{skill.category}</h3>
                  <div className="flex flex-wrap gap-4">
                     {skill.items.map(s => (
                       <span key={s} className="text-[12px] bg-white/[0.03] px-6 py-3 rounded-2xl text-gray-500 border border-white/5 hover:border-blue-500/40 hover:text-white transition-all font-black uppercase tracking-widest cursor-pointer">
                         {s}
                       </span>
                     ))}
                  </div>
               </div>
             ))}
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-24 scroll-mt-32">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-[3.5rem] p-12 md:p-20 overflow-hidden relative border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

              <div className="text-center mb-16 relative z-10">
                <p className="label-luxury text-blue-500 mb-6 text-[11px] tracking-[1em]">Connection Module</p>
                <h2 className="text-5xl md:text-8xl font-heading font-bold tracking-tight text-white mb-4 leading-[0.85]">
                  Initiate<br/>
                  <span className="text-gradient">Dialogue.</span>
                </h2>
              </div>

              <div className="grid lg:grid-cols-1 gap-14 relative z-10">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="group space-y-3">
                      <label className="label-luxury ml-1 opacity-20 text-[8px] tracking-[0.4em]">Identity Name</label>
                      <input type="text" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-700" placeholder="Your Name" />
                    </div>
                    <div className="group space-y-3">
                      <label className="label-luxury ml-1 opacity-20 text-[8px] tracking-[0.4em]">Connection Node</label>
                      <input type="email" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-700" placeholder="Email Address" />
                    </div>
                  </div>
                  <div className="group space-y-3">
                    <label className="label-luxury ml-1 opacity-20 text-[8px] tracking-[0.4em]">Message Packet</label>
                    <textarea rows={5} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none placeholder:text-gray-700" placeholder="How can we collaborate?"></textarea>
                  </div>
                  <button className="w-full py-7 bg-white text-black font-black text-[11px] uppercase tracking-[0.8em] rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 duration-500">
                    Broadcast Message
                  </button>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-12 pt-10 border-t border-white/5 opacity-60">
                    <a href={`mailto:${data.email}`} className="text-gray-400 text-sm font-light hover:text-blue-400 transition-all tracking-tight underline decoration-white/10 underline-offset-8">{data.email}</a>
                    <a href={`tel:${data.phone}`} className="text-gray-400 text-sm font-light hover:text-blue-400 transition-all tracking-tight underline decoration-white/10 underline-offset-8">{data.phone}</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 border-t border-white/[0.02] px-10">
         <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <p className="label-luxury opacity-30 text-[9px] tracking-[0.6em]">{data.name.toUpperCase()} — SYSTEM ARCHIVE 2025</p>
            <div className="flex gap-10">
              <a href={data.socials.instagram} className="label-luxury text-[8px] hover:text-blue-500 transition-colors tracking-[0.5em]">Instagram</a>
              <a href={data.socials.dribbble} className="label-luxury text-[8px] hover:text-blue-500 transition-colors tracking-[0.5em]">Dribbble</a>
              <a href={data.socials.behance} className="label-luxury text-[8px] hover:text-blue-500 transition-colors tracking-[0.5em]">Behance</a>
            </div>
            <p className="label-luxury opacity-10 text-[8px] tracking-[0.4em]">© PATNALA STUDIO</p>
         </div>
      </footer>

      <ChatWidget data={data} />
      
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} recoveryEmail="patnalaprabhakar827@gmail.com" />}
      {editingProject && <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onSave={handleSaveProject} />}
      {isAddingProject && <EditProjectModal project={{}} isNew onClose={() => setIsAddingProject(false)} onSave={handleSaveProject} />}
      {showProfileEdit && <EditProfileModal data={data} onClose={() => setShowProfileEdit(false)} onSave={persistData} />}
      {previewProject && <ProjectPreviewModal project={previewProject} onClose={() => setPreviewProject(null)} />}
    </div>
  );
};

export default App;
