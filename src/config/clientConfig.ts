import { DEFAULT_STUDIO_ASSETS } from './defaultAssets';
import type {
  AchievementItem,
  AiKnowledgeBaseData,
  ExperienceItem,
  FaqItem,
  FooterInfo,
  GalleryItem,
  NavLabels,
  ProjectItem,
  ServiceItem,
  SiteAbout,
  SiteProfile,
  SiteSettings,
  SkillItem,
  ThemeColors,
} from '../types/portfolio';

const env = import.meta.env;

export const PRICING_NOTICE =
  'Pricing is customized according to your project requirements. Contact us for a personalized quote.';

export function normalizeWhatsappHref(raw: string): string {
  const digits = (raw || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  const international = digits.startsWith('01') && digits.length === 11 ? `88${digits}` : digits;
  return `https://wa.me/${international}`;
}

export const clientConfig = {
  brandName: env.VITE_BRAND_NAME || 'ARPHANIX',
  ownerName: 'Samia Sultana Bushra',
  professionalTitle: 'Full Stack Digital Marketer, Visual Designer & UI/UX Designer',
  ventureName: 'ARPHANIX',
  location: 'Moulvibazar, Sylhet, Bangladesh',
  tagline: 'Artistry Meets Growth.',
  shortIntro:
    'Samia Sultana Bushra is a digital marketer and designer from Moulvibazar, Sylhet, Bangladesh, and founder of ARPHANIX. She combines marketing strategy with creative design to help brands grow online.',
  contactEmail: 'seo.expert.samiaa@gmail.com',
  whatsappNumber: '01852523494',
  whatsappInternational: '+8801852523494',
  facebookUrl: 'https://www.facebook.com/share/1AKjqXFkhm/',
  languages: ['Bangla', 'English'],
  adminEmail: env.VITE_ADMIN_EMAIL || 'rahihumaun369@gmail.com',
  clientAdminEmail: env.VITE_CLIENT_ADMIN_EMAIL || 'seo.expert.samiaa@gmail.com',
  adminEmails: Array.from(
    new Set([
      ...(env.VITE_ADMIN_EMAIL || 'rahihumaun369@gmail.com')
        .split(',')
        .map((e: string) => e.trim().toLowerCase())
        .filter(Boolean),
      ...(env.VITE_CLIENT_ADMIN_EMAIL || 'seo.expert.samiaa@gmail.com')
        .split(',')
        .map((e: string) => e.trim().toLowerCase())
        .filter(Boolean),
      'rahihumaun369@gmail.com',
      'seo.expert.samiaa@gmail.com',
    ])
  ),
  developerFullName: 'Md. Humaun Husen Rahi',
  developerBrand: 'WENDAXY',
  developerWebsiteUrl: 'https://wendaxy.vercel.app',
  adminEntryPath: env.VITE_ADMIN_ENTRY_PATH || '/studio-admin-portal',
  cloudinaryCloudName: env.VITE_CLOUDINARY_CLOUD_NAME || '',
  cloudinaryUploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  themePalette: {
    light: {
      bgPage: '#FAF8F3',
      bgSurface: '#F2EFE7',
      borderColor: '#DFD5C3',
      borderStrong: '#D8C7A8',
      accentPrimary: '#1B4332',
      accentSecondary: '#2D6A6A',
      accentHighlight: '#8D5B63',
      textPrimary: '#18221D',
      textMuted: '#526058',
    },
    dark: {
      bgPage: '#0A120F',
      bgSurface: '#111C17',
      borderColor: '#1E2E26',
      borderStrong: '#24352C',
      accentPrimary: '#52A58C',
      accentSecondary: '#6EC4A7',
      accentHighlight: '#C48A93',
      textPrimary: '#F4F1EA',
      textMuted: '#9BA9A1',
    },
  },
} as const;

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return clientConfig.adminEmails.includes(email.trim().toLowerCase());
}

export const DEFAULT_THEME_COLORS: ThemeColors = {
  lightPrimary: clientConfig.themePalette.light.accentPrimary,
  lightSecondary: clientConfig.themePalette.light.accentSecondary,
  lightBg: clientConfig.themePalette.light.bgPage,
  lightSurface: clientConfig.themePalette.light.bgSurface,
  darkPrimary: clientConfig.themePalette.dark.accentPrimary,
  darkSecondary: clientConfig.themePalette.dark.accentSecondary,
  darkBg: clientConfig.themePalette.dark.bgPage,
  darkSurface: clientConfig.themePalette.dark.bgSurface,
};

export const DEFAULT_NAV_LABELS: NavLabels = {
  about: 'About',
  gallery: 'Portfolio',
  projects: 'Case Studies',
  services: 'Services',
  contact: 'Contact',
  hireMe: 'Get a Quote',
  skills: 'Skills',
  experience: 'Education & Experience',
  faq: 'FAQ',
  assistant: 'AI Assistant',
};

export const DEFAULT_FOOTER_INFO: FooterInfo = {
  directoryTitle: 'Directory',
  channelsTitle: 'Direct Channels',
  copyrightText: 'All rights reserved.',
  developerContactUrl: 'https://wendaxy.vercel.app',
};

export const DEFAULT_SITE_PROFILE: SiteProfile = {
  ownerName: clientConfig.ownerName,
  professionalTitle: clientConfig.professionalTitle,
  ventureName: clientConfig.ventureName,
  location: clientConfig.location,
  tagline: clientConfig.tagline,
  shortIntro: clientConfig.shortIntro,
  heroImageUrl: DEFAULT_STUDIO_ASSETS.heroStudioPortrait,
  availabilityStatus: 'Bangla & English · Custom Project Inquiries Open',
  yearsExperience: '',
  projectsDelivered: '',
  clientSatisfaction: '',
};

export const DEFAULT_SITE_ABOUT: SiteAbout = {
  personalIntroduction:
    'Samia Sultana Bushra is a Full Stack Digital Marketer, Visual Designer & UI/UX Designer based in Moulvibazar, Sylhet, Bangladesh, and the founder of ARPHANIX. Communicating fluently in both Bangla and English, she brings marketing strategy and creative visual craft together under one roof.',
  myJourney:
    'Guided by the philosophy "Artistry Meets Growth.", Samia founded ARPHANIX as a service-based digital marketing and design brand where businesses do not have to split visual design from growth strategy.',
  businessOrTechBackground:
    'Her practice unites core digital marketing channels—SEO, Social Media Marketing, and Paid Advertising—with brand-building design disciplines including Logo Design, Branding, Visual Design, and UI/UX Design.',
  entrepreneurship:
    'ARPHANIX operates as an integrated, single-point creative and growth partner: marketing and design handled by one person so visual identity and campaign performance reinforce each other seamlessly.',
  education:
    'Honours, 1st year in the Department of Mathematics, alongside a completed freelancing course.',
  professionalGoals:
    'Helping brands build recognizable visual identities, user-friendly digital interfaces, and sustainable online growth through cohesive marketing and design execution.',
  businessInformation:
    'Brand Name: ARPHANIX · Tagline: "Artistry Meets Growth." · Business Model: Service-based digital marketing and design brand founded by Samia Sultana Bushra in Moulvibazar, Sylhet, Bangladesh. Unique Selling Points: Marketing and design handled by one person; creative visuals combined with growth strategy; communication in Bangla and English.',
  customInstructions:
    'All project pricing is customized based on individual project requirements. Public portfolio projects and client case studies will be published as they become available.',
  additionalInformation:
    'Available for communication in both Bangla and English via official email (seo.expert.samiaa@gmail.com), WhatsApp (01852523494), and Facebook.',
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: clientConfig.brandName,
  logoUrl: '',
  coverImageUrl: DEFAULT_STUDIO_ASSETS.workSpatialInterface,
  contactEmail: clientConfig.contactEmail,
  whatsappNumber: clientConfig.whatsappNumber,
  cvUrl: '',
  cvFileName: 'ARPHANIX-Profile.pdf',
  cloudinaryCloudName: clientConfig.cloudinaryCloudName,
  cloudinaryUploadPreset: clientConfig.cloudinaryUploadPreset,
  seoTitle: `${clientConfig.brandName} — ${clientConfig.ownerName} | ${clientConfig.tagline}`,
  seoDescription: clientConfig.shortIntro,
  seoOgImage: DEFAULT_STUDIO_ASSETS.workSpatialInterface,
  socialLinks: {
    facebook: clientConfig.facebookUrl,
    linkedin: '',
    github: '',
    behance: '',
    instagram: '',
    x: '',
    website: '',
  },
  themeColors: DEFAULT_THEME_COLORS,
  navLabels: DEFAULT_NAV_LABELS,
  footerInfo: DEFAULT_FOOTER_INFO,
};

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'About & Brand',
    question: 'Who is Samia Sultana Bushra?',
    answer:
      'Samia Sultana Bushra is a Full Stack Digital Marketer, Visual Designer & UI/UX Designer from Moulvibazar, Sylhet, Bangladesh, and the founder of ARPHANIX. She combines marketing strategy with creative design to help brands grow online.',
    order: 1,
  },
  {
    id: 'faq-2',
    category: 'About & Brand',
    question: 'What is ARPHANIX?',
    answer:
      'ARPHANIX is a service-based digital marketing and design brand founded by Samia Sultana Bushra. Guided by the tagline "Artistry Meets Growth.", ARPHANIX delivers integrated marketing and creative design solutions.',
    order: 2,
  },
  {
    id: 'faq-3',
    category: 'About & Brand',
    question: 'Where are you located?',
    answer:
      'Samia Sultana Bushra and ARPHANIX are based in Moulvibazar, Sylhet, Bangladesh.',
    order: 3,
  },
  {
    id: 'faq-4',
    category: 'Services & Pricing',
    question: 'What services does ARPHANIX offer?',
    answer:
      'ARPHANIX offers five core services: SEO, Social Media Marketing, Paid Advertising, Logo Design & Branding, and UI/UX Design.',
    order: 4,
  },
  {
    id: 'faq-5',
    category: 'Services & Pricing',
    question: 'How much do your services cost?',
    answer: PRICING_NOTICE,
    order: 5,
  },
  {
    id: 'faq-6',
    category: 'Design Services',
    question: 'Do you design logos and complete brand identities?',
    answer:
      'Yes. Logo Design & Branding is one of ARPHANIX’s core services, combining visual design craft with strategic brand positioning.',
    order: 6,
  },
  {
    id: 'faq-7',
    category: 'Design Services',
    question: 'What does your UI/UX Design service cover?',
    answer:
      'UI/UX Design focuses on creating clean, intuitive user interfaces and thoughtful user experiences tailored to your brand and project goals. Contact Samia directly to discuss your specific product or website requirements.',
    order: 7,
  },
  {
    id: 'faq-8',
    category: 'Marketing Services',
    question: 'What is included in your SEO service?',
    answer:
      'ARPHANIX provides SEO services aimed at strengthening your brand’s search visibility and organic online growth. Specific deliverables are tailored to your website and goals after an initial consultation.',
    order: 8,
  },
  {
    id: 'faq-9',
    category: 'Marketing Services',
    question: 'How does your Social Media Marketing service help brands?',
    answer:
      'Social Media Marketing at ARPHANIX pairs strategic audience growth with cohesive visual design so your social channels look distinctive and communicate clearly.',
    order: 9,
  },
  {
    id: 'faq-10',
    category: 'Marketing Services',
    question: 'Do you manage Paid Advertising campaigns?',
    answer:
      'Yes. Paid Advertising is part of ARPHANIX’s digital marketing services, combining growth strategy with creative visual presentation.',
    order: 10,
  },
  {
    id: 'faq-11',
    category: 'About & Brand',
    question: 'What is Samia’s educational background?',
    answer:
      'Samia is currently an Honours 1st year student in the Department of Mathematics and has completed a freelancing course.',
    order: 11,
  },
  {
    id: 'faq-12',
    category: 'Communication',
    question: 'Which languages do you communicate in?',
    answer:
      'You can communicate comfortably in both Bangla and English.',
    order: 12,
  },
  {
    id: 'faq-13',
    category: 'Communication',
    question: 'How can I contact Samia or ARPHANIX?',
    answer:
      'You can reach Samia by email at seo.expert.samiaa@gmail.com, on WhatsApp at 01852523494 (+8801852523494), through Facebook, or by submitting the inquiry form on the Contact page.',
    order: 13,
  },
  {
    id: 'faq-14',
    category: 'About & Brand',
    question: 'How do you collaborate with clients?',
    answer:
      'At ARPHANIX, both marketing strategy and visual design are handled directly by one person—Samia Sultana Bushra—ensuring cohesive creative visuals and growth-focused execution with clear Bangla or English communication.',
    order: 14,
  },
  {
    id: 'faq-15',
    category: 'Portfolio',
    question: 'Where can I view past projects or portfolio samples?',
    answer:
      'Our public portfolio showcase is currently being prepared ("Portfolio Coming Soon"). Please contact Samia directly to discuss your project requirements.',
    order: 15,
  },
  {
    id: 'faq-16',
    category: 'Policies & Logistics',
    question: 'What are your payment terms or refund policy?',
    answer:
      'Payment terms and project agreements are discussed individually when preparing your custom quote. Please contact Samia directly for details.',
    order: 16,
  },
  {
    id: 'faq-17',
    category: 'Policies & Logistics',
    question: 'How long does it take to complete a project?',
    answer:
      'Project timelines depend on the specific scope and requirements of each brief and are confirmed after reviewing your project details directly with Samia.',
    order: 17,
  },
  {
    id: 'faq-18',
    category: 'Policies & Logistics',
    question: 'How are revisions handled?',
    answer:
      'Revision arrangements are clarified and agreed upon per project before work begins. Contact Samia directly to review scope details for your project.',
    order: 18,
  },
  {
    id: 'faq-19',
    category: 'Communication',
    question: 'Do you work with international clients as well as clients in Bangladesh?',
    answer:
      'Communication is supported in both Bangla and English. Reach out directly via email, WhatsApp, or Facebook to discuss remote collaboration for your location and project goals.',
    order: 19,
  },
  {
    id: 'faq-20',
    category: 'Portfolio',
    question: 'Are client testimonials or reviews available?',
    answer:
      'Verified client testimonials are not published on the website yet. You are welcome to contact Samia directly to discuss your project needs.',
    order: 20,
  },
];

const formattedDefaultFaqsText = DEFAULT_FAQS.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');

export const DEFAULT_AI_KNOWLEDGE_BASE: AiKnowledgeBaseData = {
  assistantName: 'ARPHANIX Assistant',
  assistantRole: 'AI Portfolio & Client Guide for ARPHANIX (Samia Sultana Bushra)',
  greetingMessage:
    'Hello! I represent ARPHANIX and Samia Sultana Bushra. Ask me in English or Bangla about services, skills, background, or how to request a custom quote.',
  responseLanguage: 'Auto-detect (Bangla when user writes in Bangla, English when user writes in English)',
  responseTone: 'Warm, professional, clear, concise, and helpful',
  mainResponsibilities:
    'Represent Samia Sultana Bushra and ARPHANIX accurately using verified facts, explain services and skills, guide visitors to request custom quotations, and answer FAQs in Bangla or English.',
  allowedTopics:
    'Samia Sultana Bushra’s verified profile, ARPHANIX brand information, 7 verified skills, 5 core services, custom pricing notice, education, languages (Bangla and English), USPs, FAQs, and official contact channels.',
  avoidTopics:
    'Never claim to be Samia herself. Never invent university/college names, years of experience, client names, testimonials, fake statistics, fixed prices, delivery promises, unlimited revisions, refund policies, or unverified tools.',
  contactRecommendationBehavior:
    'Encourage visitors to contact Samia directly via email (seo.expert.samiaa@gmail.com), WhatsApp (01852523494 / +8801852523494), Facebook, or the Contact page for personalized quotes and project inquiries.',
  developerContactDetails: 'Developer: Md. Humaun Husen Rahi | Brand: WENDAXY | Website: https://wendaxy.vercel.app',
  clientIdentityIntro:
    'Samia Sultana Bushra is a Full Stack Digital Marketer, Visual Designer & UI/UX Designer from Moulvibazar, Sylhet, Bangladesh, and founder of ARPHANIX ("Artistry Meets Growth.").',
  personalBackground: DEFAULT_SITE_ABOUT.personalIntroduction,
  professionalBiography: `${DEFAULT_SITE_ABOUT.myJourney} ${DEFAULT_SITE_ABOUT.businessOrTechBackground}`,
  educationQualifications:
    'Honours, 1st year, Department of Mathematics. Completed a freelancing course. (No specific institution name is provided; do not invent one.)',
  skillsExpertise:
    'SEO, Social Media Marketing, Paid Advertising, Logo Design, Branding, Visual Design, UI/UX Design.',
  workExperience:
    'Founder of ARPHANIX, handling both digital marketing and visual/UI-UX design in one integrated service-based practice. (No specific years of experience or past client names are published.)',
  servicesPricing: `Core Services: 1) SEO (Digital Marketing), 2) Social Media Marketing (Digital Marketing), 3) Paid Advertising (Digital Marketing), 4) Logo Design & Branding (Visual & Brand Design), 5) UI/UX Design (Product & Experience Design). Pricing Notice: ${PRICING_NOTICE}`,
  projectsPortfolio:
    'Portfolio Coming Soon. No public client projects or case studies are published yet.',
  businessInformation:
    'Brand: ARPHANIX | Tagline: "Artistry Meets Growth." | Model: Service-based digital marketing and design brand | Location: Moulvibazar, Sylhet, Bangladesh | Languages: Bangla and English | USPs: Marketing and design handled by one person; creative visuals combined with growth strategy; communication in Bangla and English.',
  achievements:
    'No awards or external accolades are currently listed.',
  contactInformation:
    'Email: seo.expert.samiaa@gmail.com | WhatsApp: 01852523494 (+8801852523494, https://wa.me/8801852523494) | Facebook: https://www.facebook.com/share/1AKjqXFkhm/ | Contact Form: /contact',
  faqs: formattedDefaultFaqsText,
  customInstructions:
    'Always represent Samia Sultana Bushra and ARPHANIX in the third person; never claim to actually be Samia. If asked something not verified in the knowledge base or live Firestore snapshot, reply honestly: "I don\'t have verified information about that. Please contact Samia directly." (or the clear Bangla equivalent when responding in Bangla).',
  additionalInformation:
    'Respond in Bangla when the user writes in Bangla, and in English when the user writes in English.',
  rawKnowledgeDocument: '',
  versionNumber: 1,
  previousSnapshotJson: '',
};

// Empty by default until real portfolio projects/works are added via Admin CMS ("Portfolio Coming Soon").
export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [];

export const DEFAULT_PROJECTS: ProjectItem[] = [];

export const DEFAULT_SKILLS: SkillItem[] = [
  { id: 'skill-1', name: 'SEO', category: 'Digital Marketing', proficiency: '', order: 1 },
  { id: 'skill-2', name: 'Social Media Marketing', category: 'Digital Marketing', proficiency: '', order: 2 },
  { id: 'skill-3', name: 'Paid Advertising', category: 'Digital Marketing', proficiency: '', order: 3 },
  { id: 'skill-4', name: 'Logo Design', category: 'Design', proficiency: '', order: 4 },
  { id: 'skill-5', name: 'Branding', category: 'Design', proficiency: '', order: 5 },
  { id: 'skill-6', name: 'Visual Design', category: 'Design', proficiency: '', order: 6 },
  { id: 'skill-7', name: 'UI/UX Design', category: 'UI/UX & Product Design', proficiency: '', order: 7 },
];

export const DEFAULT_EXPERIENCE: ExperienceItem[] = [
  {
    id: 'edu-1',
    type: 'education',
    role: 'Honours, 1st Year',
    organization: 'Department of Mathematics',
    period: 'In Progress',
    location: '',
    summary: 'Pursuing undergraduate Honours studies in the Department of Mathematics.',
    order: 1,
  },
  {
    id: 'edu-2',
    type: 'education',
    role: 'Freelancing Course',
    organization: 'Freelancing Training',
    period: 'Completed',
    location: '',
    summary: 'Completed a freelancing course supporting digital marketing and creative design services.',
    order: 2,
  },
];

// Empty by default until verified achievements are added via Admin CMS.
export const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [];

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'svc-1',
    title: 'SEO',
    category: 'Digital Marketing',
    summary:
      'Search engine optimization tailored to strengthen organic visibility, search presence, and long-term online discoverability.',
    features: [
      'Search visibility & organic growth strategy',
      'Website & content alignment for search',
      'Integrated with broader digital marketing goals',
    ],
    startingPrice: PRICING_NOTICE,
    imageUrl: '',
    order: 1,
  },
  {
    id: 'svc-2',
    title: 'Social Media Marketing',
    category: 'Digital Marketing',
    summary:
      'Cohesive social media marketing combining creative brand visuals with strategic growth execution for Bangla and English audiences.',
    features: [
      'Creative visual alignment with growth strategy',
      'Brand-consistent social media direction',
      'Bilingual communication in Bangla & English',
    ],
    startingPrice: PRICING_NOTICE,
    imageUrl: '',
    order: 2,
  },
  {
    id: 'svc-3',
    title: 'Paid Advertising',
    category: 'Digital Marketing',
    summary:
      'Goal-focused paid advertising campaigns structured to connect compelling visual creatives with measurable online brand growth.',
    features: [
      'Ad creative & marketing strategy alignment',
      'Targeted campaign planning for online growth',
      'Single-point execution for visuals & ads',
    ],
    startingPrice: PRICING_NOTICE,
    imageUrl: '',
    order: 3,
  },
  {
    id: 'svc-4',
    title: 'Logo Design & Branding',
    category: 'Visual & Brand Design',
    summary:
      'Distinctive logo design and cohesive visual branding systems crafted to give businesses an authentic, memorable identity.',
    features: [
      'Custom logo design & visual direction',
      'Cohesive brand styling & visual design',
      'Built to support digital marketing presence',
    ],
    startingPrice: PRICING_NOTICE,
    imageUrl: '',
    order: 4,
  },
  {
    id: 'svc-5',
    title: 'UI/UX Design',
    category: 'Product & Experience Design',
    summary:
      'Human-centered user interface and experience design focused on clarity, visual craft, and intuitive digital journeys.',
    features: [
      'Clean UI visual design & layout structure',
      'User experience flow & usability focus',
      'Cohesive alignment with brand identity',
    ],
    startingPrice: PRICING_NOTICE,
    imageUrl: '',
    order: 5,
  },
];
