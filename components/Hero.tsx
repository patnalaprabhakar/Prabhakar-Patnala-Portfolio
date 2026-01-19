
import React from 'react';

interface HeroProps {
  data: {
    name: string;
    title: string;
    heroHeadline: string;
    availabilityStatus: string;
  }
}

const Hero: React.FC<HeroProps> = ({ data }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 120, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
      {/* Immersive Depth Layers - Calibrated for Subtlety */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] bg-blue-600/5 rounded-full blur-[180px] animate-blob-slow"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] bg-indigo-500/5 rounded-full blur-[160px] animate-blob-slow" style={{animationDelay: '-5s'}}></div>
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]"></div>
      </div>
      
      <div className="relative z-10 text-center w-full max-w-7xl flex flex-col items-center">
        {/* Editorial Status Badge */}
        <div className="inline-flex items-center gap-3 px-6 py-2.5 mb-16 rounded-full glass-premium border-white/5 shadow-2xl animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{data.availabilityStatus}</span>
        </div>
        
        {/* Massive Headline - Editorial Lockdown */}
        <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[11vw] font-heading font-bold tracking-[-0.06em] leading-[0.8] mb-16 text-balance drop-shadow-2xl">
          <span className="block text-reveal-mask text-white mb-2">
            {data.heroHeadline.split(' ').slice(0, 2).join(' ')}
          </span>
          <span className="block text-reveal-mask text-white/20 italic" style={{animationDelay: '0.2s'}}>
            {data.heroHeadline.split(' ').slice(2).join(' ')}
          </span>
        </h1>

        {/* Sub-description - Strategic Spacing */}
        <div className="flex flex-col md:flex-row items-center gap-12 max-w-3xl opacity-0 animate-fade-in" style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>
           <p className="text-lg md:text-xl text-white/30 leading-relaxed font-light text-balance text-center">
            I am <span className="text-white font-medium">{data.name}</span>, a {data.title}. 
            Architecting high-fidelity digital experiences where technical logic meets human intuition.
          </p>
        </div>

        {/* The Two Primary Action Buttons - "Perfect" Layout */}
        <div className="flex flex-col sm:flex-row items-center gap-8 mt-20 opacity-0 animate-fade-in" style={{animationDelay: '0.8s', animationFillMode: 'forwards'}}>
          <button 
            onClick={() => scrollToSection('projects')}
            className="group relative px-14 py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.5em] rounded-full overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.15)]"
          >
            Explore Work
          </button>
          
          <button 
            onClick={() => scrollToSection('contact')}
            className="px-14 py-6 glass-premium text-white/60 text-[11px] font-black uppercase tracking-[0.5em] rounded-full hover:text-white transition-all hover:bg-white/[0.05] border-white/10"
          >
            Start Dialogue
          </button>
        </div>
      </div>

      {/* Modernist Scroll Prompt */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-8 opacity-20 hover:opacity-100 transition-opacity duration-1000 group">
        <div className="h-20 w-px bg-gradient-to-b from-white via-white/50 to-transparent"></div>
        <span className="text-[9px] font-black uppercase tracking-[0.8em] group-hover:translate-y-2 transition-transform">Scroll</span>
      </div>
    </section>
  );
};

export default Hero;
