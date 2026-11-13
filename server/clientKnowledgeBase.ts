export interface ClientKnowledgeBase {
  brandName: string;
  ownerName: string;
  ventureName: string;
  professionalTitle: string;
  tagline: string;
  location: string;
  languagesSupported: string[];
  verifiedSummary: string;
  education: string[];
  verifiedSkills: string[];
  coreServices: Array<{ title: string; category: string }>;
  pricingNotice: string;
  uniqueSellingPoints: string[];
  portfolioStatus: string;
  contactChannels: {
    email: string;
    whatsappDisplay: string;
    whatsappUrl: string;
    facebookUrl: string;
  };
  contactGuidance: string;
  strictGuardrails: string[];
  developerBrand: string;
  developerWebsiteUrl: string;
  developerAttributionRule: string;
}

/**
 * Verified client knowledge base for ARPHANIX — Samia Sultana Bushra.
 */
export const CLIENT_KNOWLEDGE_BASE: ClientKnowledgeBase = {
  brandName: process.env.VITE_BRAND_NAME || 'ARPHANIX',
  ownerName: 'Samia Sultana Bushra',
  ventureName: 'ARPHANIX',
  professionalTitle: 'Full Stack Digital Marketer, Visual Designer & UI/UX Designer',
  tagline: 'Artistry Meets Growth.',
  location: 'Moulvibazar, Sylhet, Bangladesh',
  languagesSupported: ['Bangla', 'English'],
  verifiedSummary:
    'Samia Sultana Bushra is a digital marketer and designer from Moulvibazar, Sylhet, Bangladesh, and founder of ARPHANIX ("Artistry Meets Growth."). ARPHANIX is a service-based digital marketing and design brand where she combines marketing strategy with creative design to help brands grow online.',
  education: [
    'Honours, 1st year — Department of Mathematics (no university/college name is published)',
    'Completed a freelancing course (no institution name is published)',
  ],
  verifiedSkills: [
    'SEO',
    'Social Media Marketing',
    'Paid Advertising',
    'Logo Design',
    'Branding',
    'Visual Design',
    'UI/UX Design',
  ],
  coreServices: [
    { title: 'SEO', category: 'Digital Marketing' },
    { title: 'Social Media Marketing', category: 'Digital Marketing' },
    { title: 'Paid Advertising', category: 'Digital Marketing' },
    { title: 'Logo Design & Branding', category: 'Visual & Brand Design' },
    { title: 'UI/UX Design', category: 'Product & Experience Design' },
  ],
  pricingNotice:
    'Pricing is customized according to your project requirements. Contact us for a personalized quote.',
  uniqueSellingPoints: [
    'Marketing and design handled by one person.',
    'Creative visuals combined with growth strategy.',
    'Communication in Bangla and English.',
  ],
  portfolioStatus: 'Portfolio Coming Soon (no verified public case studies or client projects are published yet).',
  contactChannels: {
    email: 'seo.expert.samiaa@gmail.com',
    whatsappDisplay: '01852523494',
    whatsappUrl: 'https://wa.me/8801852523494',
    facebookUrl: 'https://www.facebook.com/share/1AKjqXFkhm/',
  },
  contactGuidance:
    'Prospective clients can request a custom quotation or discuss project details via the Contact page (/contact), Email (seo.expert.samiaa@gmail.com), WhatsApp (01852523494 / +8801852523494), or Facebook.',
  strictGuardrails: [
    'You represent Samia Sultana Bushra and ARPHANIX as an AI assistant. Speak in the third person about Samia and ARPHANIX; NEVER claim to actually be Samia herself.',
    'Tone & Personality: Warm, professional, clear, concise, and helpful.',
    'Language Rule: Automatically respond in Bangla when the user writes in Bangla, and respond in English when the user writes in English. Support seamless language switching.',
    'Strict Truthfulness & Anti-Fabrication: NEVER invent qualifications, university/college names, years of experience, software tools, past clients, project names, awards, testimonials, statistics, fixed prices, packages, turnaround deadlines, unlimited revisions, guaranteed results, or payment/refund policies not explicitly present in the verified knowledge base or live Firestore snapshot.',
    'Missing Information Rule: If the user asks about anything without verified information in the knowledge base or live Firestore snapshot, reply directly and honestly with: "I don\'t have verified information about that. Please contact Samia directly." (or the natural Bangla equivalent when conversing in Bangla), and provide her verified Email (seo.expert.samiaa@gmail.com), WhatsApp (01852523494), or Contact page.',
  ],
  developerBrand: 'WENDAXY',
  developerWebsiteUrl: 'https://wendaxy.vercel.app',
  developerAttributionRule:
    'Only if the user specifically asks who created, designed, or developed this website, answer honestly and concisely that it was designed and developed by WENDAXY, share the developer website link (https://wendaxy.vercel.app), and include the developer’s full name if configured in Developer Contact Details. Never promote, advertise, or mention WENDAXY unprompted during normal client or business conversations.',
};
