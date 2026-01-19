
import React, { useState, useEffect } from 'react';

interface NavbarProps {
  isAdmin?: boolean;
  onLogout?: () => void;
  onLoginClick?: () => void;
  onEditProfile?: () => void;
  resumeUrl?: string;
}

const Navbar: React.FC<NavbarProps> = ({ isAdmin, onLogout, onLoginClick, onEditProfile, resumeUrl }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'projects', 'experience', 'skills', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
          return;
        }
      }
      setActiveSection(window.scrollY < 100 ? 'home' : '');
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    } else if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Work' },
    { id: 'experience', label: 'Timeline' },
    { id: 'skills', label: 'Skills' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <>
      <nav className="fixed top-6 inset-x-0 z-[100] flex justify-center px-6 pointer-events-none">
        <div className="pointer-events-auto glass-premium rounded-full p-2 flex items-center gap-1 md:gap-3 shadow-2xl transition-all duration-500 hover:scale-[1.02]">
          
          {/* Brand Icon */}
          <button 
            onClick={() => scrollToSection('home')}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-all group"
          >
            <span className="font-heading font-bold text-white text-lg">P<span className="text-blue-500">.</span></span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button 
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                  activeSection === link.id 
                    ? 'bg-white text-black shadow-xl' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-2">
             <a 
               href={resumeUrl}
               target="_blank"
               className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg"
             >
               CV
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             </a>

             {isAdmin ? (
               <button onClick={onEditProfile} className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center border border-emerald-500/20 transition-all">
                 <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /></svg>
               </button>
             ) : (
               <button onClick={onLoginClick} className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all">
                 <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
               </button>
             )}
             
             <button 
               onClick={() => setMobileMenuOpen(true)}
               className="md:hidden w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all"
             >
               <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[110] bg-[#050505] transition-all duration-700 flex flex-col ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         <div className="p-10 flex justify-end">
            <button onClick={() => setMobileMenuOpen(false)} className="p-4 text-white/50 hover:text-white transition-colors bg-white/5 rounded-full">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
         </div>
         <div className="flex-1 flex flex-col items-center justify-center gap-10">
            {navLinks.map((link, i) => (
              <button 
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-5xl font-heading font-bold text-white hover:text-blue-500 transition-colors tracking-tighter"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {link.label}
              </button>
            ))}
            <div className="h-px w-24 bg-white/10"></div>
            <a href={resumeUrl} target="_blank" className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 hover:text-white transition-colors">Dispatch CV</a>
         </div>
      </div>
    </>
  );
};

export default Navbar;
