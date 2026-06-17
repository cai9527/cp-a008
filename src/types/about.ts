export interface CompanyInfo {
  name: string;
  slogan: string;
  description: string;
  fullDescription: string;
  foundedYear: string;
  employees: string;
  headquarters: string;
  website: string;
  logo: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar: string;
  bio: string;
  expertise: string[];
}

export interface TimelineItem {
  id: string;
  year: string;
  month: string;
  title: string;
  description: string;
  type: 'milestone' | 'product' | 'event' | 'award';
  icon: string;
}

export interface CultureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  industry: string;
  description: string;
  website: string;
  cooperationStart: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  wechat: string;
}
