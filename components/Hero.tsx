
import React from 'react';

interface HeroProps {
  isAdmin?: boolean;
  onEdit?: () => void;
  data: {
    name: string;
    title: string;
    heroHeadline: string;
    availabilityStatus: string;
    resumeUrl: string;
  }
}

const Hero: React.FC<HeroProps> = ({ isAdmin, onEdit, data }) => {
  const headlineLines = [
    { text: "Designing", gradient: false },
    { text: "Connections through", gradient: true },
    { text: "Interfaces", gradient: false }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-20 px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square bg-blue-600/5 rounded-full blur-[100px] pointer-events-none opacity-40"></div>

      <div className="relative z-10 text-center w-full max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Availability Badge - Slightly smaller */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-10 glass rounded-full border border-white/10 shadow-xl backdrop-blur-2xl animate-in slide-in-from-top duration-700">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
          </span>
          <span className="label-luxury text-blue-400 text-[8px] tracking-[0.4em] font-bold">{data.availabilityStatus}</span>
        </div>
        
        {/* Editorial Headline - Reduced Size */}
        <h1 className="flex flex-col mb-10 font-heading font-bold tracking-tighter text-white select-none gap-0">
          {headlineLines.map((line, i) => (
            <span 
              key={i} 
              className={`text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] leading-[1.05] ${line.gradient ? 'text-gradient py-1' : ''} transition-all duration-700 whitespace-nowrap px-4`}
            >
              {line.text}
            </span>
          ))}
        </h1>

        <div className="max-w-xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <p className="text-sm md:text-lg text-gray-400 leading-relaxed font-light tracking-tight px-4 md:px-0 opacity-80">
            I am <span className="text-white font-medium">{data.name}</span>. {data.title}. 
            I architect <span className="text-white font-medium italic underline decoration-blue-500/40 underline-offset-[8px] decoration-1">digital projects</span> that bridge the gap between concept and connection.
          </p>

          {/* Action Buttons - Increased Height via padding-y (py-7) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-4">
            <button 
              onClick={() => scrollToSection('projects')}
              className="w-full sm:w-auto px-12 py-7 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-xl active:scale-95"
            >
              Explore Work
            </button>
            
            <button 
              onClick={() => scrollToSection('contact')}
              className="w-full sm:w-auto px-12 py-7 glass text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:text-white transition-all border border-white/10 hover:border-white/20 active:scale-95"
            >
              Broadcast
            </button>
          </div>
        </div>
      </div>

      {/* Aesthetic Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20 hidden md:flex group cursor-pointer" onClick={() => scrollToSection('about')}>
         <div className="w-[1px] h-12 bg-gradient-to-b from-blue-500 via-white/50 to-transparent group-hover:h-16 transition-all duration-500"></div>
         <span className="text-[7px] font-black uppercase tracking-[0.5em] -rotate-90 origin-right translate-x-2 translate-y-8 text-blue-400">Scroll Archive</span>
      </div>
    </section>
  );
};

export default Hero;
