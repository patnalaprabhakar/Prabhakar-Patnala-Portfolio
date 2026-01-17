
import React from 'react';
import { Project } from '../types';

interface ProjectPreviewModalProps {
  project: Project;
  onClose: () => void;
}

const ProjectPreviewModal: React.FC<ProjectPreviewModalProps> = ({ project, onClose }) => {
  const hasDemo = project.links.demo && project.links.demo !== '#';
  const hasGithub = project.links.github && project.links.github !== '#';

  const ensureAbsoluteUrl = (url?: string) => {
    if (!url || url === '#') return '#';
    if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
    return `https://${url}`;
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-2xl">
      <div className="w-full max-w-6xl glass rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/10 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 z-50 p-4 bg-black/50 hover:bg-white/10 rounded-full text-white backdrop-blur-md border border-white/10 transition-all"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Hero Header */}
          <div className="relative h-[40vh] md:h-[50vh] w-full bg-gray-900">
            <img 
              src={project.imageUrls[0]} 
              alt={project.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent"></div>
            
            <div className="absolute bottom-12 left-12 right-12">
               <div className="flex flex-wrap gap-2 mb-4">
                 {project.tags.map(tag => (
                   <span key={tag} className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[9px] font-bold uppercase tracking-widest rounded-lg backdrop-blur-md">
                     {tag}
                   </span>
                 ))}
               </div>
               <h2 className="text-4xl md:text-6xl font-heading font-bold text-white tracking-tighter">{project.title}</h2>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-8 md:p-16 grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              <div>
                <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.4em] mb-4">The Narrative</h3>
                <p className="text-xl md:text-2xl text-white leading-relaxed font-light">
                  {project.description}
                </p>
              </div>
              
              <div className="h-px bg-white/5"></div>
              
              <div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-4">Execution Details</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {project.longDescription || "This project explores the synthesis of advanced digital interfaces with human-centric ergonomics. By prioritizing cognitive ease and visual rhythm, we've created a narrative that transcends traditional product design."}
                </p>
              </div>

              {project.imageUrls.length > 1 && (
                <div className="grid grid-cols-2 gap-4 pt-8">
                   {project.imageUrls.slice(1).map((url, i) => (
                     <div key={i} className="aspect-video rounded-3xl overflow-hidden border border-white/5">
                        <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     </div>
                   ))}
                </div>
              )}
            </div>

            {/* Sidebar Meta */}
            <div className="lg:col-span-4 space-y-10 lg:pl-12 lg:border-l border-white/5">
               <div>
                 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-4">Role</h3>
                 <p className="text-white text-sm font-medium">Principal Designer</p>
               </div>
               
               <div>
                 <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-4">Timeline</h3>
                 <p className="text-white text-sm font-medium">Q3 2023 - Q1 2024</p>
               </div>

               <div className="pt-8 space-y-4">
                 {hasDemo && (
                    <a 
                      href={ensureAbsoluteUrl(project.links.demo)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-white text-black text-center font-bold text-[10px] uppercase tracking-widest rounded-2xl block hover:bg-gray-200 transition-all shadow-xl"
                    >
                      View Project
                    </a>
                 )}
                 {hasGithub && (
                    <a 
                      href={ensureAbsoluteUrl(project.links.github)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-white/5 border border-white/10 text-white text-center font-bold text-[10px] uppercase tracking-widest rounded-2xl block hover:bg-white/10 transition-all"
                    >
                      Process Repository
                    </a>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreviewModal;
