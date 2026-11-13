export interface ThemeColors {
  lightPrimary: string;
  lightSecondary: string;
  lightBg: string;
  lightSurface: string;
  darkPrimary: string;
  darkSecondary: string;
  darkBg: string;
  darkSurface: string;
}

export interface NavLabels {
  about: string;
  gallery: string;
  projects: string;
  services: string;
  contact: string;
  hireMe: string;
  skills: string;
  experience: string;
  faq?: string;
  assistant: string;
}

export interface FooterInfo {
  directoryTitle: string;
  channelsTitle: string;
  copyrightText: string;
  developerContactUrl: string;
}

export interface SiteProfile {
  ownerName: string;
  professionalTitle: string;
  ventureName: string;
  location: string;
  tagline: string;
  shortIntro: string;
  heroImageUrl: string;
  availabilityStatus: string;
  yearsExperience: string;
  projectsDelivered: string;
  clientSatisfaction: string;
  updatedAt?: unknown;
}

export interface SiteAbout {
  personalIntroduction: string;
  myJourney: string;
  businessOrTechBackground: string;
  entrepreneurship: string;
  education: string;
  professionalGoals: string;
  businessInformation?: string;
  customInstructions?: string;
  additionalInformation?: string;
  updatedAt?: unknown;
}

export interface SocialLinks {
  facebook?: string;
  linkedin?: string;
  github?: string;
  behance?: string;
  instagram?: string;
  x?: string;
  website?: string;
}

export interface SiteSettings {
  brandName: string;
  logoUrl?: string;
  coverImageUrl?: string;
  contactEmail: string;
  whatsappNumber: string;
  cvUrl: string;
  cvFileName: string;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  seoTitle: string;
  seoDescription: string;
  seoOgImage: string;
  socialLinks: SocialLinks;
  themeColors?: ThemeColors;
  navLabels?: NavLabels;
  footerInfo?: FooterInfo;
  updatedAt?: unknown;
}

export interface AiKnowledgeBaseData {
  assistantName: string;
  assistantRole: string;
  greetingMessage: string;
  responseLanguage: string;
  responseTone: string;
  mainResponsibilities: string;
  allowedTopics: string;
  avoidTopics: string;
  contactRecommendationBehavior: string;
  developerContactDetails: string;
  clientIdentityIntro: string;
  personalBackground: string;
  professionalBiography: string;
  educationQualifications: string;
  skillsExpertise: string;
  workExperience: string;
  servicesPricing: string;
  projectsPortfolio: string;
  businessInformation: string;
  achievements: string;
  contactInformation: string;
  faqs: string;
  customInstructions: string;
  additionalInformation: string;
  rawKnowledgeDocument: string;
  versionNumber?: number;
  previousSnapshotJson?: string;
  updatedAt?: unknown;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  externalUrl: string;
  featured: boolean;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type ProjectStatus = 'Published' | 'In Progress' | 'Archived' | 'Completed';

export interface ProjectItem {
  id: string;
  title: string;
  client: string;
  status: ProjectStatus;
  problem: string;
  solution: string;
  techStack: string[];
  screenshots: string[];
  liveUrl: string;
  repoUrl: string;
  featured: boolean;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  proficiency: string;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ExperienceItem {
  id: string;
  type: 'work' | 'education';
  role: string;
  organization: string;
  period: string;
  location: string;
  summary: string;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AchievementItem {
  id: string;
  title: string;
  issuer: string;
  year: string;
  description: string;
  certificateUrl: string;
  imageUrl: string;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ServiceItem {
  id: string;
  title: string;
  category?: string;
  summary: string;
  features: string[];
  startingPrice: string;
  imageUrl: string;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type MessageStatus = 'unread' | 'read' | 'archived';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  projectType: string;
  budgetRange: string;
  description: string;
  status: MessageStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AiSource {
  title: string;
  uri: string;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: AiSource[];
  createdAt: number;
}

export interface AiThread {
  id: string;
  title: string;
  persona: AiPersona;
  messages: AiMessage[];
  updatedAt: number;
}

export type AiPersona = 'concierge' | 'advisor' | 'strategist';
export type AiMode = 'fast' | 'balanced' | 'deep';
