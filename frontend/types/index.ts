export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogoInitials: string;
  location: string;
  experienceMin: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  employmentType: string;
  postedAt: string;
  category: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  education?: string;
  aboutCompany?: string;
  openings?: number;
}

export interface JobCategory {
  id: string;
  name: string;
  description: string;
  jobCount: number;
  slug: string;
}

export interface Company {
  id: string;
  name: string;
  initials: string;
}

export interface FilterState {
  category: string;
  experienceMin: number | null;
  experienceMax: number | null;
  location: string;
  salaryMin: number | null;
  employmentType: string;
  datePosted: string;
}
