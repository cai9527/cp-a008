export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  createdAt: string;
  views: number;
  tags: string[];
}

export interface GuideItem {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  steps: GuideStep[];
  coverImage: string;
  createdAt: string;
  updatedAt: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

export interface GuideStep {
  step: number;
  title: string;
  description: string;
  tips?: string[];
}

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  type: string;
  title: string;
  content: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface GuideCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}
