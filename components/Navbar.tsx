
import React, { useState, useEffect } from 'react';

interface NavbarProps {
  isAdmin?: boolean;
  onLogout?: () => void;
  onLoginClick?: () => void;
  onEditProfile?: () => void;
  resumeUrl?: string;
}

const Navbar: React.FC<NavbarProps> = ({ isAdmin, onLogout, onLoginClick, onEditProfile, resumeUrl }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ensureAbsoluteUrl = (url?: string) => {
    if (!url || url === '#') return '#';
    if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
    return `https://${url}`;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id.replace('#', ''));
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Identity', href: 'about' },
    { name: 'Projects', href: 'projects' },
    { name: 'Journey', href: 'experience' },
    { name: 'Expertise', href: 'skills' },
    { name: 'Broadcast', href: 'contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-in-out ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className={`max-w-[1440px] mx-auto px-6 md:px-12 transition-all duration-500 ${scrolled ? 'glass rounded-full border-white/5 bg-black/60 shadow-2xl py-3' : 'bg-transparent py-0'}`}>
        <div className="flex justify-between items-center">
          {/* Brand */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="text-xl font-bold font-heading tracking-tight text-white hover:text-blue-500 transition-colors group flex items-center"
          >
            PRABHAKAR<span className="text-blue-500 group-hover:pl-0.5 transition-all">.</span>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex gap-8">
              {navLinks.map((link) => (
                <button 
                  key={link.name} 
                  onClick={() => scrollToSection(link.href)}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
            </div>
            
            <div className="h-4 w-px bg-white/10 mx-2"></div>

            <div className="flex items-center gap-4">
              <div className="group relative">
                {/* Tooltip Popup - Moved to bottom (top-full mt-3) */}
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-3 py-1.5 glass rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform -translate-y-2 group-hover:translate-y-0 z-[110]">
                  <span className="text-[7px] font-black uppercase tracking-[0.3em] text-blue-400 whitespace-nowrap">Access Resume</span>
                </div>
                
                <a 
                  href={ensureAbsoluteUrl(resumeUrl)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-white hover:bg-blue-600/10 border border-blue-500/20 rounded-full transition-all flex items-center gap-2"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  CV
                </a>
              </div>

              {isAdmin && (
                <button 
                  onClick={onEditProfile}
                  className="p-2.5 bg-white/5 text-gray-400 hover:text-white rounded-full transition-all border border-white/5 hover:border-blue-500/50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /></svg>
                </button>
              )}

              {isAdmin ? (
                <button onClick={onLogout} className="px-5 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Sign Out</button>
              ) : (
                <button onClick={onLoginClick} className="p-2.5 text-gray-500 hover:text-blue-500 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-white p-3 glass rounded-2xl border border-white/10 hover:border-blue-500/40 transition-all">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[120] bg-black/98 flex flex-col items-center justify-center p-12 backdrop-blur-3xl transition-all animate-in fade-in zoom-in duration-300">
           <button onClick={() => setMobileMenuOpen(false)} className="absolute top-8 right-8 p-5 text-white bg-white/5 rounded-full border border-white/10">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
           <div className="flex flex-col space-y-10 text-center">
              {navLinks.map((link) => (
                <button key={link.name} onClick={() => scrollToSection(link.href)} className="text-4xl font-heading font-bold text-white hover:text-blue-500 transition-all tracking-tighter uppercase">{link.name}</button>
              ))}
              <div className="h-px w-24 bg-white/10 mx-auto"></div>
              <a href={ensureAbsoluteUrl(resumeUrl)} target="_blank" rel="noopener noreferrer" className="text-2xl font-heading font-bold text-blue-500 flex items-center justify-center gap-4 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                RESOURCE ACCESS
              </a>
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
