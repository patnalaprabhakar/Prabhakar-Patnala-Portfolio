
export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  imageUrls: string[];
  links: {
    github?: string;
    demo?: string;
  };
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string[];
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  instagram: string;
  behance: string;
  dribbble: string;
}

export interface PortfolioData {
  name: string;
  title: string;
  about: string;
  aboutHeadline: string;
  profileImage: string;
  resumeUrl: string;
  yearsExperience: string;
  heroHeadline: string;
  availabilityStatus: string;
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  email: string;
  phone: string;
  socials: SocialLinks;
}
