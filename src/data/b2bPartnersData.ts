import { B2BPartnerLead, B2BPartnerCategory } from '../types';

export type B2BTemplateCategory = 
  | B2BPartnerCategory 
  | 'all' 
  | 'operational' 
  | 'document_request' 
  | 'general_inquiry' 
  | 'visa_status';

export interface B2BPitchTemplate {
  id: string;
  category: B2BTemplateCategory;
  templateGroup: 'client_operations' | 'b2b_partnerships' | 'general';
  title: string;
  titleBn: string;
  subject: string;
  subjectBn: string;
  body: string;
  bodyBn: string;
  badge: string;
  descriptionEn?: string;
  descriptionBn?: string;
  tags?: string[];
  isCustom?: boolean;
  isModified?: boolean;
  lastModified?: string;
}

export interface B2BCategoryMeta {
  category: B2BPartnerCategory;
  nameEn: string;
  nameBn: string;
  icon: string;
  badgeColor: string;
  descriptionEn: string;
  descriptionBn: string;
  whyContactEn: string;
  whyContactBn: string;
  saasValueProposition: string;
}

export const B2B_CATEGORIES: B2BCategoryMeta[] = [
  {
    category: 'typing_center',
    nameEn: 'Typing Centers & Amer Centers',
    nameBn: 'টাইপিং সেন্টার ও আমের সেন্টার (UAE)',
    icon: 'Building2',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    descriptionEn: 'Government-authorized typing desks (Amer, Tasheel, GDRFA typing) processing thousands of UAE residence and visit visas daily.',
    descriptionBn: 'দুবাই ও ইউএই-এর সরকার অনুমোদিত টাইপিং ও আমের সেন্টার যা প্রতিদিন শত শত ভিসা প্রসেসিং করে।',
    whyContactEn: 'Typing errors or non-compliant passport photos cost centers AED 350+ in non-refundable government typing fees. Our SaaS pre-audits documents in 2 seconds with 0% rejection guarantee.',
    whyContactBn: 'ভুল পাসপোর্ট বা ছবির কারণে আবেদন বাতিল হলে প্রতিটি আবেদনে ৩৫০ দিরহাম সরকারি ফি লোকসান হয়। আমাদের সফটওয়্যার ২ সেকেন্ডে অডিট করে ফি সুরক্ষিত রাখে।',
    saasValueProposition: 'Protect typing fees, boost customer turnaround 10x, and eliminate GDRFA rejection fines.'
  },
  {
    category: 'travel_agency',
    nameEn: 'Travel & Tourism Agencies',
    nameBn: 'ট্রাভেল ও ট্যুরিজম এজেন্সি (UAE ও আন্তর্জাতিক)',
    icon: 'Plane',
    badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    descriptionEn: 'High-volume tourist visa sellers in Dubai, Bangladesh, India, Pakistan, Nepal, and the GCC issuing 30/60-day visit visas.',
    descriptionBn: 'দুবাই, বাংলাদেশ, ভারত ও জিসিসি অঞ্চলের ট্রাভেল এজেন্সি যারা পর্যটন ও ভিজিট ভিসা ইস্যু করে।',
    whyContactEn: 'Travel agents manage hundreds of travelers weekly. They need instant 6-month validity checks and automated WhatsApp/Gmail client alerts so travelers never get stuck at airport check-in.',
    whyContactBn: 'ট্রাভেলারদের পাসপোর্ট ৬ মাস মেয়াদ আছে কিনা ও ছবি নিখুঁত কিনা তা সাথে সাথে নিশ্চিত করা এবং ক্লায়েন্টকে অটোমেটিক জিমেইল আপডেট পাঠানো।',
    saasValueProposition: 'Bulk passport upload, zero airport offloading risk, and automated white-label customer receipts.'
  },
  {
    category: 'manpower_recruitment',
    nameEn: 'Manpower & Recruitment Agencies',
    nameBn: 'ম্যানপাওয়ার ও জনশক্তি রপ্তানি এজেন্সি (BD, IN, GCC)',
    icon: 'Users',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    descriptionEn: 'Recruiting agencies sending thousands of migrant workers, technicians, and hospitality staff from South Asia to the UAE.',
    descriptionBn: 'বাংলাদেশ, ভারত ও দক্ষিণ এশিয়া থেকে সংযুক্ত আরব আমিরাতে জনশক্তি রপ্তানিকারক রিক্রুটিং লাইসেন্সধারী এজেন্সি।',
    whyContactEn: 'Workers often arrive with damaged passports, blurry scans, or expiring dates leading to embassy embargoes and visa entry denials. Our batch audit checks 50+ worker passports at once.',
    whyContactBn: 'শ্রমিকদের পাসপোর্ট মেয়াদোত্তীর্ণ থাকলে বা ত্রুটিপূর্ণ হলে ভিসা আটকে যায়। আমাদের ব্যাচ প্রসেসিং একসাথে ৫০+ কর্মীর পাসপোর্ট পরীক্ষা করে।',
    saasValueProposition: 'Batch processing 100+ worker dossiers, 180-day compliance verification, and instant ICP clearance readiness.'
  },
  {
    category: 'corporate_pro',
    nameEn: 'Corporate PRO & Business Setup Firms',
    nameBn: 'কর্পোরেট PRO ও বিজনেস সেটআপ ফার্ম',
    icon: 'Briefcase',
    badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    descriptionEn: 'Corporate service providers managing enterprise work permits, partner/investor visas, and free zone employee sponsorships.',
    descriptionBn: 'দুবাইয়ের বিজনেস সেটআপ কোম্পানি ও করপোরেট পিআরও যারা ইনভেস্টর ও এমপ্লয়মেন্ট ভিসা হ্যান্ডেল করে।',
    whyContactEn: 'Companies need high-end multi-applicant tracking, executive Golden Visa qualification screening, and GDRFA status dashboard.',
    whyContactBn: 'কোম্পানির উচ্চপদস্থ কর্মকর্তা ও বিনিয়োগকারীদের ভিসা দ্রুত প্রসেসিং এবং গোল্ডেন ভিসার যোগ্যতা সরাসরি ক্যালকুলেট করার জন্য।',
    saasValueProposition: 'Unified GDRFA/ICP portal, corporate dossier exports, and high-margin B2B retainer packages.'
  },
  {
    category: 'golden_visa',
    nameEn: 'Golden Visa & Relocation Advisors',
    nameBn: 'গোল্ডেন ভিসা ও এমিগ্রেশন কনসালট্যান্ট',
    icon: 'Award',
    badgeColor: 'bg-amber-400/10 text-amber-200 border-amber-400/30',
    descriptionEn: 'Specialized legal and immigration advisors serving high-net-worth investors, real estate buyers, and top executives.',
    descriptionBn: 'উচ্চবিত্ত বিনিয়োগকারী, প্রপার্টি ক্রেতা এবং বিশেষ পেশাজীবীদের জন্য ১০ বছর মেয়াদি গোল্ডেন ভিসা বিশেষজ্ঞ।',
    whyContactEn: 'They need our 2M AED real estate equity verification, executive 30k AED salary screening, and official compliance report generator to close high-ticket clients.',
    whyContactBn: '২ মিলিয়ন দিরহাম প্রপার্টি ও ৩০ হাজার দিরহাম বেতনের ক্রাইটেরিয়া মূল্যায়ন করে ক্লায়েন্টদের দ্রুত অনুমোদন নিশ্চিত করার জন্য।',
    saasValueProposition: 'Premium branded Golden Visa audit certificates and high-ticket client intake automation.'
  }
];

export const INITIAL_B2B_PARTNERS: B2BPartnerLead[] = [
  // 1. Typing & Amer Centers (UAE)
  {
    id: 'partner-1',
    companyName: 'Al Barsha Amer Center (GDRFA Authorized)',
    category: 'typing_center',
    contactPerson: 'Rashid Al Nuaimi',
    designation: 'Managing Director & Typing Desk Lead',
    email: 'operations@albarsha-amer.ae',
    secondaryEmail: 'manager@albarsha-typing.com',
    phone: '+971 4 341 8888',
    whatsapp: '+971 50 123 4567',
    city: 'Dubai (Sheikh Zayed Rd)',
    country: 'United Arab Emirates',
    estimatedVolume: '1,200+ Visas/month',
    status: 'new',
    notes: 'Key target for AI Passport Pre-Audit. Can save AED 25,000+ monthly in typing rejection penalties.'
  },
  {
    id: 'partner-2',
    companyName: 'Deira Clock Tower Amer & Tasheel Center',
    category: 'typing_center',
    contactPerson: 'Farhan Tariq',
    designation: 'Operations Supervisor',
    email: 'amer.desk@deiratyping.ae',
    secondaryEmail: 'contact@clocktowertyping.ae',
    phone: '+971 4 295 5500',
    whatsapp: '+971 55 987 6543',
    city: 'Dubai (Deira)',
    country: 'United Arab Emirates',
    estimatedVolume: '2,500+ Visas/month',
    status: 'new',
    notes: 'Handles heavy volume of South Asian & African tourist/visit visas. Eager for batch processing.'
  },
  {
    id: 'partner-3',
    companyName: 'Bur Dubai Al Fahidi Document Clearing & Typing',
    category: 'typing_center',
    contactPerson: 'Sultan Al Marzouqi',
    designation: 'General Manager',
    email: 'visa@alfahididocuments.ae',
    secondaryEmail: 'info@burdubai-amer.com',
    phone: '+971 4 353 2211',
    whatsapp: '+971 52 444 3322',
    city: 'Dubai (Bur Dubai)',
    country: 'United Arab Emirates',
    estimatedVolume: '950+ Visas/month',
    status: 'new',
    notes: 'Specializes in family residence visas and tourist visa extensions.'
  },
  {
    id: 'partner-4',
    companyName: 'Al Karama Express Visa Services & Amer Desk',
    category: 'typing_center',
    contactPerson: 'Mohammed Kamal',
    designation: 'Branch Head',
    email: 'express@karama-visas.ae',
    phone: '+971 4 397 1212',
    whatsapp: '+971 56 321 0987',
    city: 'Dubai (Karama)',
    country: 'United Arab Emirates',
    estimatedVolume: '1,800+ Visas/month',
    status: 'new',
    notes: 'High demand for automatic client status SMS/Gmail alerts.'
  },
  {
    id: 'partner-5',
    companyName: 'Abu Dhabi Musaffah Tasheel & ICP Typing Hub',
    category: 'typing_center',
    contactPerson: 'Ahmed Al Mansoori',
    designation: 'Executive Director',
    email: 'corporate@musaffahtyping.ae',
    phone: '+971 2 555 4321',
    whatsapp: '+971 50 888 7766',
    city: 'Abu Dhabi (Musaffah)',
    country: 'United Arab Emirates',
    estimatedVolume: '3,000+ Visas/month',
    status: 'new',
    notes: 'Major industrial worker visa processor for Abu Dhabi & Western Region.'
  },
  {
    id: 'partner-6',
    companyName: 'Sharjah Al Nahda Quick Amer & ICP Service Center',
    category: 'typing_center',
    contactPerson: 'Ibrahim Khalil',
    designation: 'Operations Partner',
    email: 'visas@sharjahalnahda-typing.ae',
    phone: '+971 6 531 4455',
    city: 'Sharjah',
    country: 'United Arab Emirates',
    estimatedVolume: '1,100+ Visas/month',
    status: 'new',
    notes: 'High interest in white-label agency portal for multiple operators.'
  },

  // 2. Travel & Tourism Agencies (UAE, Bangladesh, India, GCC)
  {
    id: 'partner-7',
    companyName: 'Rayna Tours & Travels (B2B Visa Division)',
    category: 'travel_agency',
    contactPerson: 'Sunil Kumar',
    designation: 'Head of B2B Visa Operations',
    email: 'b2bvisas@raynatours.com',
    secondaryEmail: 'partners@raynaholidays.ae',
    phone: '+971 4 208 7444',
    whatsapp: '+971 54 777 9900',
    city: 'Dubai (Business Bay)',
    country: 'United Arab Emirates',
    estimatedVolume: '8,000+ Visas/month',
    status: 'new',
    notes: 'One of the largest destination management companies in the UAE. Target for enterprise API / Whitelabel SaaS.'
  },
  {
    id: 'partner-8',
    companyName: 'Musafir.com (B2B Agency Partnerships)',
    category: 'travel_agency',
    contactPerson: 'Sachin Gadoya',
    designation: 'VP of Commercial Partnerships',
    email: 'b2bpartner@musafir.com',
    secondaryEmail: 'corporate@musafir.ae',
    phone: '+971 6 516 6666',
    city: 'Sharjah & Dubai',
    country: 'United Arab Emirates',
    estimatedVolume: '5,000+ Visas/month',
    status: 'new',
    notes: 'High-volume OTA processing inbound Dubai leisure visas from India and Bangladesh.'
  },
  {
    id: 'partner-9',
    companyName: 'ShareTrip Corporate & B2B Travel Desk',
    category: 'travel_agency',
    contactPerson: 'Sadman Rahman',
    designation: 'Head of Outbound Visas & Holidays',
    email: 'b2b@sharetrip.net',
    secondaryEmail: 'visa-desk@sharetrip.net',
    phone: '+880 9617 617617',
    whatsapp: '+880 1711 002233',
    city: 'Dhaka (Banani)',
    country: 'Bangladesh',
    estimatedVolume: '2,200+ Dubai Visas/month',
    status: 'new',
    notes: 'Leading Bangladeshi OTA. Needs automated pre-check to stop passport rejection before flight ticketing.'
  },
  {
    id: 'partner-10',
    companyName: 'Bengal Air Holidays & Travel Services',
    category: 'travel_agency',
    contactPerson: 'Kazi Mahbub Alam',
    designation: 'Managing Partner',
    email: 'corporate@bengalairholidays.com',
    secondaryEmail: 'visas@bengalair.bd',
    phone: '+880 2 988 5544',
    whatsapp: '+880 1819 554433',
    city: 'Dhaka (Gulshan-2)',
    country: 'Bangladesh',
    estimatedVolume: '1,400+ Dubai Visas/month',
    status: 'new',
    notes: 'Top agent for Dubai 30-day tourist visas and family holiday packages.'
  },
  {
    id: 'partner-11',
    companyName: 'GoZayaan Corporate Visa Partnerships',
    category: 'travel_agency',
    contactPerson: 'Tanveer Ahmed',
    designation: 'Commercial Manager',
    email: 'partners@gozayaan.com',
    secondaryEmail: 'visa@gozayaan.bd',
    phone: '+880 9606 912912',
    city: 'Dhaka (Mohakhali DOHS)',
    country: 'Bangladesh',
    estimatedVolume: '1,900+ Dubai Visas/month',
    status: 'new',
    notes: 'Digital travel platform. Interested in our automated email/WhatsApp notification webhook.'
  },
  {
    id: 'partner-12',
    companyName: 'Akbar Travels of India (Dubai Regional Hub)',
    category: 'travel_agency',
    contactPerson: 'K.V. Abdul Latheef',
    designation: 'GCC Regional Director',
    email: 'dubai.b2b@akbartravels.com',
    secondaryEmail: 'visas@akbartravels.ae',
    phone: '+971 4 388 9900',
    city: 'Dubai (Meena Bazaar)',
    country: 'United Arab Emirates',
    estimatedVolume: '6,500+ Visas/month',
    status: 'new',
    notes: 'Processes thousands of express 24h tourist visas for travelers from Mumbai, Delhi, and Kerala.'
  },
  {
    id: 'partner-13',
    companyName: 'Chittagong Royal Aviation & Tourism',
    category: 'travel_agency',
    contactPerson: 'Nurul Islam Chowdhury',
    designation: 'Proprietor & Director',
    email: 'visa@ctg-royalaviation.com',
    phone: '+880 31 654 321',
    whatsapp: '+880 1817 998877',
    city: 'Chittagong (Agrabad)',
    country: 'Bangladesh',
    estimatedVolume: '850+ Dubai Visas/month',
    status: 'new',
    notes: 'Frequent issues with passport photo background rejections; our Photo Auditor will solve this.'
  },

  // 3. Manpower & Overseas Recruitment Agencies
  {
    id: 'partner-14',
    companyName: 'BAIRA Alliance Network (Overseas Employment Desk)',
    category: 'manpower_recruitment',
    contactPerson: 'Shamim Ahmed Chowdhury',
    designation: 'Joint Secretary (International Relations)',
    email: 'corporate@bairab2b.org',
    secondaryEmail: 'desk@baira-bd.org',
    phone: '+880 2 934 8877',
    city: 'Dhaka (Kakrail)',
    country: 'Bangladesh',
    estimatedVolume: '15,000+ Worker Visas/quarter',
    status: 'new',
    notes: 'Network of international recruiters. Huge SaaS deployment opportunity for bulk worker compliance.'
  },
  {
    id: 'partner-15',
    companyName: 'Dynamic Overseas Manpower Consultants Dhaka',
    category: 'manpower_recruitment',
    contactPerson: 'Engr. Masud Rana',
    designation: 'Managing Director',
    email: 'visa-dept@dynamic-overseas.com',
    secondaryEmail: 'masud@dynamicmanpower.bd',
    phone: '+880 2 839 1234',
    whatsapp: '+880 1713 445566',
    city: 'Dhaka (Bijoynagar)',
    country: 'Bangladesh',
    estimatedVolume: '2,500+ Worker Visas/year',
    status: 'new',
    notes: 'Sends construction & hospitality staff to Dubai and Abu Dhabi. Demands batch 6-month validity check.'
  },
  {
    id: 'partner-16',
    companyName: 'Gulf Overseas Human Resources Chittagong',
    category: 'manpower_recruitment',
    contactPerson: 'Mohammad Faruk',
    designation: 'Operations Head',
    email: 'visas@gulf-overseas.com',
    secondaryEmail: 'operations@gulfmanpower.bd',
    phone: '+880 31 712 345',
    city: 'Chittagong (GEC Circle)',
    country: 'Bangladesh',
    estimatedVolume: '1,800+ Worker Visas/year',
    status: 'new',
    notes: 'Worker files frequently suffer from unreadable handwritten MRZ or expired passports.'
  },
  {
    id: 'partner-17',
    companyName: 'Soundlines Group Overseas Manpower (Dubai Office)',
    category: 'manpower_recruitment',
    contactPerson: 'Azeem Siddiqui',
    designation: 'Recruitment Director',
    email: 'b2b@soundlinesme.com',
    secondaryEmail: 'dubai@soundlinesgroup.com',
    phone: '+971 4 228 1199',
    city: 'Dubai (Al Garhoud)',
    country: 'United Arab Emirates',
    estimatedVolume: '4,000+ Worker Visas/year',
    status: 'new',
    notes: 'Supplies major UAE construction and facilities management conglomerates.'
  },
  {
    id: 'partner-18',
    companyName: 'Al-Mansoori Manpower Services LLC',
    category: 'manpower_recruitment',
    contactPerson: 'Jamal Al Mansoori',
    designation: 'Sponsorship Director',
    email: 'recruitment@almansoorimanpower.ae',
    phone: '+971 4 268 4400',
    city: 'Dubai & Sharjah',
    country: 'United Arab Emirates',
    estimatedVolume: '2,100+ Worker Visas/year',
    status: 'new',
    notes: 'High demand for automated Arabic & English biometric visa reports.'
  },

  // 4. Corporate PRO & Business Setup Firms
  {
    id: 'partner-19',
    companyName: 'Virtuzone Business Setup Dubai',
    category: 'corporate_pro',
    contactPerson: 'Neil Petch',
    designation: 'Chairman & Head of Partner Relations',
    email: 'partnerships@vz.ae',
    secondaryEmail: 'corporate-pro@vz.ae',
    phone: '+971 4 457 8200',
    city: 'Dubai (Downtown / Bay Square)',
    country: 'United Arab Emirates',
    estimatedVolume: '3,500+ Investor Visas/year',
    status: 'new',
    notes: 'Market leader in company formation. High synergy with our Golden Visa and Investor Visa audit engine.'
  },
  {
    id: 'partner-20',
    companyName: 'Creative Zone Corporate Services',
    category: 'corporate_pro',
    contactPerson: 'Lorenzo Jooris',
    designation: 'CEO & Head of Alliances',
    email: 'partnerships@creativezone.ae',
    secondaryEmail: 'b2b@creativezone.ae',
    phone: '+971 4 567 7333',
    city: 'Dubai (Business Bay)',
    country: 'United Arab Emirates',
    estimatedVolume: '4,200+ Corporate Visas/year',
    status: 'new',
    notes: 'Top client for our white-label SaaS agency CRM desk.'
  },
  {
    id: 'partner-21',
    companyName: 'Shuraa Management & Business Setup',
    category: 'corporate_pro',
    contactPerson: 'Shahid Rather',
    designation: 'Head of Corporate PRO Division',
    email: 'corporate@shuraa.com',
    secondaryEmail: 'visas@shuraabusiness.ae',
    phone: '+971 4 408 1900',
    city: 'Dubai (Sheikh Zayed Rd)',
    country: 'United Arab Emirates',
    estimatedVolume: '2,800+ Visas/year',
    status: 'new',
    notes: 'Handles high-net-worth investor residency packages with GDRFA VIP desk.'
  },
  {
    id: 'partner-22',
    companyName: 'Flyingcolour Business Setup & PRO Services',
    category: 'corporate_pro',
    contactPerson: 'Rajeev Kumar',
    designation: 'Managing Partner',
    email: 'info@flyingcolour.com',
    secondaryEmail: 'visa-audit@flyingcolour.ae',
    phone: '+971 4 454 2366',
    city: 'Dubai (Fortune Tower, JLT)',
    country: 'United Arab Emirates',
    estimatedVolume: '1,600+ Visas/year',
    status: 'new',
    notes: 'Established PRO firm since 2004. Interested in real-time ICP / GDRFA tracker portal.'
  },

  // 5. Golden Visa & Relocation Advisors
  {
    id: 'partner-23',
    companyName: 'Henley & Partners (Dubai Hub)',
    category: 'golden_visa',
    contactPerson: 'Philippe Amarante',
    designation: 'Managing Partner & Head of Middle East',
    email: 'dubai@henleyglobal.com',
    secondaryEmail: 'uae-visa@henleyglobal.com',
    phone: '+971 4 392 7722',
    city: 'Dubai (DIFC)',
    country: 'United Arab Emirates',
    estimatedVolume: '800+ Golden Visas/year',
    status: 'new',
    notes: 'World leader in residence by investment. High-value clients requiring 2M AED real estate validation.'
  },
  {
    id: 'partner-24',
    companyName: 'Sovereign Group (Dubai Relocation Division)',
    category: 'golden_visa',
    contactPerson: 'Nicholas Cully',
    designation: 'Group Sales Director',
    email: 'dubai@sovereigngroup.com',
    secondaryEmail: 'goldenvisa@sovereign-me.com',
    phone: '+971 4 270 3400',
    city: 'Dubai (Al Fattan Currency House, DIFC)',
    country: 'United Arab Emirates',
    estimatedVolume: '650+ Golden Visas/year',
    status: 'new',
    notes: 'Serves European & GCC executives qualifying under the 30k AED/mo executive path.'
  },
  {
    id: 'partner-25',
    companyName: 'Gulf Legal & Immigration Advisory Partners',
    category: 'golden_visa',
    contactPerson: 'Adv. Tariq Al Qasimi',
    designation: 'Senior Immigration Partner',
    email: 'advisors@gulflegal.ae',
    secondaryEmail: 'goldenvisa@gulfimmigration.ae',
    phone: '+971 4 319 9000',
    city: 'Dubai & Abu Dhabi',
    country: 'United Arab Emirates',
    estimatedVolume: '900+ Golden Visas/year',
    status: 'new',
    notes: 'Specializes in scientist, executive, and property buyer 10-year Golden Visa approvals.'
  }
];

export const TEMPLATE_VARIABLES = [
  { key: '{{clientName}}', labelEn: 'Client / Applicant Name', labelBn: 'আবেদনকারীর নাম', example: 'Mohammed Al-Hashimi' },
  { key: '{{companyName}}', labelEn: 'Company / Partner Name', labelBn: 'কোম্পানি / এজেন্সির নাম', example: 'Al Barsha Amer Center' },
  { key: '{{contactPerson}}', labelEn: 'Contact Person', labelBn: 'যোগাযোগকারীর নাম', example: 'Tariq Al-Mansoor' },
  { key: '{{appRef}}', labelEn: 'Application Ref No.', labelBn: 'আবেদন রেফারেন্স নং', example: 'GDRFA-2026-89412' },
  { key: '{{visaType}}', labelEn: 'Visa Category', labelBn: 'ভিসার ধরন', example: '30-Day Tourist Visa' },
  { key: '{{status}}', labelEn: 'Status', labelBn: 'বর্তমান স্ট্যাটাস', example: 'Under Security Pre-Clearance' },
  { key: '{{missingDocs}}', labelEn: 'Missing Documents List', labelBn: 'বাকি থাকা ডকুমেন্টস', example: '• High-resolution passport scan (clear bio page)\n• ICAO biometric white-background photo (35x45mm)' },
  { key: '{{expiryDate}}', labelEn: 'Passport Expiry Date', labelBn: 'পাসপোর্টের মেয়াদ', example: '15-Nov-2026' },
  { key: '{{senderName}}', labelEn: 'Your Name / Designation', labelBn: 'আপনার নাম ও পদবি', example: 'Ahmed Khan (Operations Head)' },
  { key: '{{agencyName}}', labelEn: 'Your Agency / Organization', labelBn: 'আপনার এজেন্সি', example: 'Dubai Visa AI Hub' },
];

export const B2B_PITCH_TEMPLATES: B2BPitchTemplate[] = [
  // 1. Visa Application Update (Client Operations)
  {
    id: 'template-visa-status-update',
    category: 'visa_status',
    templateGroup: 'client_operations',
    badge: 'Status Update',
    title: 'Visa Application Update',
    titleBn: 'ভিসা আবেদন স্ট্যাটাস ও প্রগ্রেস আপডেট',
    descriptionEn: 'Send automated status notifications regarding GDRFA / ICP processing stages to clients or partners.',
    descriptionBn: 'ক্লায়েন্ট বা পার্টনারকে তাদের ভিসা ফাইলের বর্তমান অবস্থা ও পরবর্তী করণীয় জানানোর জন্য।',
    tags: ['Status', 'GDRFA', 'ICP', 'Client Update', 'Tracking'],
    subject: 'Update on UAE Visa Application #{{appRef}} - {{status}}',
    subjectBn: 'ইউএই ভিসা আবেদন নং {{appRef}} সংক্রান্ত আপডেট - {{status}}',
    body: `Dear {{clientName}},

This is an official progress update regarding your UAE Visa Application submitted under reference number: {{appRef}}.

Application Summary:
• Applicant Name: {{clientName}}
• Sponsoring Entity / Partner: {{companyName}}
• Visa Classification: {{visaType}}
• Processing Authority: General Directorate of Residency and Foreigners Affairs (GDRFA Dubai) / Federal Authority (ICP)
• Current Stage: {{status}}

Status Details & Next Steps:
Your documentation has undergone preliminary biometric & passport verification. It is currently being processed through official immigration security channels.

You do not need to take any additional action at this moment. Our team is actively monitoring your application queue and will send your official e-Visa PDF approval as soon as it is granted.

If you have any questions or require urgent escalation, please reply directly to this email or reach us on WhatsApp.

Warm regards,

{{senderName}}
Visa Operations & Clearance Desk
{{agencyName}}
Portal: https://dubai-visa-ai.app
WhatsApp Support: +971 50 123 4567`,
    bodyBn: `শ্রদ্ধেয় {{clientName}},

রেফারেন্স নম্বর {{appRef}}-এর অধীনে দাখিলকৃত আপনার ইউএই ভিসা আবেদনের বর্তমান স্ট্যাটাস আপডেট নিচে প্রদান করা হলো:

আবেদনের সারসংক্ষেপ:
• আবেদনকারীর নাম: {{clientName}}
• স্পন্সরিং প্রতিষ্ঠান / পার্টনার: {{companyName}}
• ভিসার ধরন: {{visaType}}
• নিয়ন্ত্রণকারী কর্তৃপক্ষ: জিডিআরএফএ দুবাই (GDRFA Dubai) / ফেডারেল অথরিটি (ICP)
• বর্তমান অবস্থা: {{status}}

বর্তমান অগ্রগতি ও পরবর্তী ধাপ:
আপনার দাখিলকৃত পাসপোর্ট ও বায়োমেট্রিক ছবি প্রাথমিক অডিটে উত্তীর্ণ হয়েছে এবং বর্তমানে সরকারি ইমিগ্রেশন যাচাইকরণের প্রক্রিয়ায় রয়েছে।

এই মুহূর্তে আপনার পক্ষ থেকে বাড়তি কোনো পদক্ষেপ নেওয়ার প্রয়োজন নেই। ভিসা অনুমোদন হওয়ার সাথে সাথে অফিসিয়াল ই-ভিসা পিডিএফ আপনার ইমেইলে পাঠিয়ে দেওয়া হবে।

যেকোনো তথ্যের জন্য এই ইমেইলে রিপ্লাই দিন অথবা সরাসরি যোগাযোগ করুন।

ধন্যবাদান্তে,

{{senderName}}
ভিসা প্রসেসিং উইং
{{agencyName}}`
  },

  // 2. Missing Documents Request (Client Operations)
  {
    id: 'template-missing-docs-request',
    category: 'document_request',
    templateGroup: 'client_operations',
    badge: 'Missing Documents',
    title: 'Missing Documents Request',
    titleBn: 'প্রয়োজনীয় ডকুমেন্ট ও অডিট সংশোধন অনুরোধ',
    descriptionEn: 'Request clear passport scans, compliant biometric photos, or attested certificates to prevent rejection.',
    descriptionBn: 'পাসপোর্টের ঝাপসা স্ক্যান, ভুল ব্যাকগ্রাউন্ডের ছবি বা সত্যায়িত সার্টিফিকেট দ্রুত চেয়ে পাঠানোর অনুরোধ।',
    tags: ['Documents', 'Action Required', 'Passport', 'Photo', 'Urgent'],
    subject: 'Action Required: Missing Documents for UAE Visa Application #{{appRef}}',
    subjectBn: 'জরুরি নোটিশ: ইউএই ভিসা আবেদন নং {{appRef}}-এর জন্য প্রয়োজনীয় ডকুমেন্ট প্রেরণ প্রসঙ্গে',
    body: `Dear {{clientName}} / {{contactPerson}},

During our pre-submission compliance audit for UAE Visa Application reference #{{appRef}} ({{companyName}}), our verification system flagged missing or non-compliant documents required under GDRFA Dubai / ICP regulations.

Pending Documents Required Immediately:
{{missingDocs}}

Mandatory Document Compliance Guidelines:
1. Passport Scan: Must be a crisp color scan showing all 4 corners, bio-data, and bottom 2-line Machine Readable Zone (MRZ). Validity must exceed 6 months (180 days).
2. Passport Photo: Strict plain white background (pure RGB 245+), neutral expression, no tinted spectacles or heavy reflections, 80% face coverage.
3. Attested Certificates (if applicable): Degrees and relationship proofs must carry UAE MOFA attestation stamps.

Why Prompt Submission is Critical:
Submitting incomplete files risks immediate rejection on the government portal, resulting in forfeiture of non-refundable typing and immigration fees.

Please reply to this email with the requested high-resolution files attached within 48 hours to keep your application on schedule.

Thank you for your prompt assistance.

Sincerely,

{{senderName}}
Compliance & Quality Assurance Desk
{{agencyName}}
Direct Email: {{senderEmail}}`,
    bodyBn: `শ্রদ্ধেয় {{clientName}} / {{contactPerson}},

ইউএই ভিসা আবেদন রেফারেন্স নং #{{appRef}} ({{companyName}})-এর প্রাক-জমা অডিট চলাকালে সরকারি নিয়ম অনুযায়ী কিছু প্রয়োজনীয় ডকুমেন্টের ঘাটতি বা ক্রুটি পরিলক্ষিত হয়েছে।

যেসব ডকুমেন্ট জরুরিভাবে পুনরায় জমা দিতে হবে:
{{missingDocs}}

ইউএই সরকারি স্পেসিফিকেশন নির্দেশিকা:
১. পাসপোর্ট কপি: স্পষ্ট রঙিন স্ক্যান যেখানে পাসপোর্টের ৪টি কোণ ও নিচের ২-লাইনের MRZ কোড সম্পূর্ণ পাঠযোগ্য। মেয়াদের অন্তত ৬ মাস (১৮০ দিন) বাকি থাকতে হবে।
২. পাসপোর্ট সাইজ ছবি: সম্পূর্ণ সাদা ব্যাকগ্রাউন্ড, কোনো রঙিন চশমা ছাড়া, ৮০% মুখমণ্ডল স্পষ্ট দেখা যেতে হবে।
৩. সত্যায়ন: প্রযোজ্য ক্ষেত্রে ইউএই পররাষ্ট্র মন্ত্রণালয় (MOFA) সত্যায়িত সার্টিফিকেট।

কেন দ্রুত জমা দেওয়া জরুরি:
অসম্পূর্ণ ডকুমেন্ট সরকারি পোর্টালে জমা দিলে ফাইল বাতিল হয়ে যায় এবং সরকারি ফি লোকসান হয়।

আবেদন দ্রুত সম্পন্ন করতে অনুগ্রহ করে আগামী ৪৮ ঘণ্টার মধ্যে সংশোধিত ডকুমেন্টের কপি এই ইমেইলে রিপ্লাই দিয়ে পাঠান।

ধন্যবাদান্তে,

{{senderName}}
ডকুমেন্ট ভেরিফিকেশন ডেস্ক
{{agencyName}}`
  },

  // 3. General Inquiry & Services Consultation (General)
  {
    id: 'template-general-inquiry',
    category: 'general_inquiry',
    templateGroup: 'general',
    badge: 'General Inquiry',
    title: 'General Inquiry & Services Consultation',
    titleBn: 'সাধারণ তথ্য ও প্রসেসিং কোটা অনুসন্ধান',
    descriptionEn: 'Professional inquiry to agencies regarding visa quota, processing fees, timelines, or collaboration.',
    descriptionBn: 'ভিসা রেট, ইস্যু করার সময়সীমা, কোটা এবং পারস্পরিক ব্যবসায়িক সুযোগ সম্পর্কে তথ্য জানার জন্য।',
    tags: ['Inquiry', 'Rates', 'Turnaround', 'B2B', 'Services'],
    subject: 'Inquiry Regarding UAE Visa Services & Business Collaboration - {{companyName}}',
    subjectBn: 'ইউএই ভিসা প্রসেসিং ও ব্যবসায়িক সুযোগ সংক্রান্ত তথ্য অনুসন্ধান - {{companyName}}',
    body: `Dear {{contactPerson}} and Management Team at {{companyName}},

I hope this email finds you well.

We are reaching out from {{agencyName}} to inquire about your current visa processing workflows and explore mutually beneficial business collaboration for UAE visa services.

Key Information Requested:
1. Prevailing B2B Rates & Turnaround: What are your standard processing rates and average issuance timelines for 30-Day and 60-Day tourist visas, residency entry permits, and freelance visas?
2. Quota & Direct Submission Access: Do you have direct quota allocation with GDRFA Dubai or ICP for high-volume family groups and corporate travelers?
3. Quality Assurance & Pre-Audit: We utilize specialized AI-driven passport and biometric photo pre-audit technology to ensure zero government fee forfeiture from invalid scans. Would your desk be open to receiving pre-audited, ready-to-issue applicant dossiers?

We would welcome the opportunity to discuss how our teams can work together to increase client volume, cut turnaround times, and deliver superior service.

Could we schedule a brief 10-minute exploratory conversation this week?

Thank you for your time, and we look forward to hearing from you.

Best regards,

{{senderName}}
Business Development & Alliances
{{agencyName}}
Portal: https://dubai-visa-ai.app
Direct Phone: +971 50 123 4567`,
    bodyBn: `শ্রদ্ধেয় {{contactPerson}} এবং {{companyName}} ম্যানেজমেন্ট,

আশা করি আপনারা ভালো আছেন।

আমরা {{agencyName}}-এর পক্ষ থেকে ইউএই ভিসা প্রসেসিং সেবা এবং যৌথ ব্যবসায়িক অংশীদারিত্বের সুযোগ সম্পর্কে তথ্য জানার জন্য যোগাযোগ করছি।

আমাদের অনুসন্ধানের মূল বিষয়সমূহ:
১. বর্তমান বিটুবি রেট ও সময়সীমা: ৩০ ও ৬০ দিনের ট্যুরিস্ট ভিসা, রেসিডেন্স এন্ট্রি পারমিট এবং ফ্রিল্যান্স ভিসার জন্য আপনাদের বর্তমান পাইকারি রেট এবং ইস্যুর গড় সময় কত?
২. বাল্ক কোটা ও সরকারি সাবমিশন সুবিধা: বড় গ্রুপ, ট্যুর পার্টি ও করপোরেট ক্লায়েন্টদের জন্য আপনাদের সরাসরি GDRFA বা ICP সিস্টেমে সাবমিশন কোটা সুবিধা রয়েছে কি?
৩. প্রি-অডিট নিশ্চয়তা: আমরা অত্যাধুনিক এআই প্রযুক্তির মাধ্যমে প্রতিটি পাসপোর্ট ও ছবি আগে থেকেই ১০০% নির্ভুলভাবে প্রস্তুত করি, যাতে কোনো সরকারি ফি নষ্ট না হয়।

উভয় প্রতিষ্ঠানের যৌথ ব্যবসার মাধ্যমে ভিসা প্রসেসিং ভলিউম বাড়ানোর বিষয়ে আপনার সাথে সংক্ষেপে আলোচনা করতে আগ্রহী।

এ সপ্তাহে কি ১০ মিনিটের একটি সংক্ষিপ্ত ফোনে কথা বলা সম্ভব হবে?

ধন্যবাদান্তে,

{{senderName}}
বিজনেস ডেভেলপমেন্ট টিম
{{agencyName}}`
  },

  // 4. Visa Approval & e-Visa Dispatch (Client Operations)
  {
    id: 'template-visa-approval',
    category: 'operational',
    templateGroup: 'client_operations',
    badge: 'Visa Approved',
    title: 'Visa Approval & e-Visa Dispatch',
    titleBn: 'ভিসা অনুমোদন ও অফিসিয়াল ই-ভিসা প্রেরণ',
    descriptionEn: 'Deliver approved e-Visa PDFs with entry validity warnings and travel check-in instructions.',
    descriptionBn: 'ভিসা অনুমোদনের পর ক্লায়েন্টকে অভিনন্দন জানিয়ে ই-ভিসা কপি ও ট্রাভেল নির্দেশিকা পাঠানো।',
    tags: ['Approved', 'e-Visa', 'Celebration', 'Entry Rules'],
    subject: 'CONGRATULATIONS: Your UAE e-Visa is Approved! Ref #{{appRef}}',
    subjectBn: 'অভিনন্দন: আপনার ইউএই ই-ভিসা অনুমোদিত হয়েছে! রেফারেন্স #{{appRef}}',
    body: `Dear {{clientName}},

Congratulations! We are pleased to inform you that your UAE Visa Application (Reference: #{{appRef}}) has been officially APPROVED by immigration authorities.

Approval Details:
• Applicant Name: {{clientName}}
• Application Reference: {{appRef}}
• Visa Category: {{visaType}}
• Sponsoring Desk: {{companyName}}
• Status: APPROVED & ISSUED

Important Travel Instructions:
1. Print Color Copies: Please print at least two crisp color copies of the attached e-Visa PDF before your travel.
2. Passport Validity: Ensure your original passport has at least 6 months validity from your planned entry date into the UAE.
3. Return Ticket & Accommodation: Airline check-in counters require a confirmed return flight ticket and hotel booking/residence address proof.

We wish you a safe journey and a memorable stay in the United Arab Emirates.

Warm congratulations,

{{senderName}}
{{agencyName}}
Support Desk: +971 50 123 4567`,
    bodyBn: `শ্রদ্ধেয় {{clientName}},

অভিনন্দন! আনন্দের সাথে জানাচ্ছি যে আপনার ইউএই ভিসা আবেদন (রেফারেন্স: #{{appRef}}) ইমিগ্রেশন কর্তৃপক্ষ কর্তৃক অনুমোদিত হয়েছে।

অনুমোদনের বিবরণ:
• আবেদনকারীর নাম: {{clientName}}
• আবেদন রেফারেন্স: {{appRef}}
• ভিসার ধরন: {{visaType}}
• বর্তমান অবস্থা: অনুমোদিত (APPROVED)

ভ্রমণকালীন জরুরি নির্দেশিকা:
১. রঙিন কপি প্রিন্ট: ভ্রমণের সময় সাথে রাখার জন্য সংযুক্ত ই-ভিসা পিডিএফ-এর অন্তত দুটি রঙিন প্রিন্ট কপি সাথে রাখুন।
২. পাসপোর্টের মেয়াদ: ইউএইতে প্রবেশের দিন থেকে আপনার মূল পাসপোর্টের অন্তত ৬ মাস মেয়াদ অবশিষ্ট থাকা আবশ্যক।
৩. রিটার্ন টিকিট ও হোটেল বুকিং: এয়ারপোর্ট চেক-ইন কাউন্টারে রিটার্ন টিকিট এবং হোটেল বা বাসার ঠিকানার কপি প্রদর্শন করতে হবে।

আপনার ইউএই সফর নিরাপদ ও আনন্দদায়ক হোক।

শুভেচ্ছান্তে,

{{senderName}}
{{agencyName}}`
  },

  // 5. 6-Month Passport Expiry Urgent Notice (Client Operations)
  {
    id: 'template-passport-validity-warning',
    category: 'operational',
    templateGroup: 'client_operations',
    badge: 'Urgent Alert',
    title: '6-Month Passport Expiry Urgent Notice',
    titleBn: 'জরুরি নোটিশ: পাসপোর্টের মেয়াদ ৬ মাসের কম',
    descriptionEn: 'Alert travelers and booking desks that passport validity is under 180 days to stop airline offloading.',
    descriptionBn: 'ভিসা ইস্যু বা ফ্লাইটের আগে পাসপোর্টের মেয়াদ ১৮০ দিনের কম থাকলে জরুরি সতর্কতা পাঠানো।',
    tags: ['Urgent', 'Validity', '180-Day Rule', 'Offloading Risk'],
    subject: 'URGENT COMPLIANCE: Passport Validity Less Than 6 Months for {{clientName}} - Ref #{{appRef}}',
    subjectBn: 'জরুরি সতর্কতা: পাসপোর্টের মেয়াদ ৬ মাসের কম থাকায় ভিসা জটিলতা - রেফারেন্স #{{appRef}}',
    body: `URGENT NOTICE FOR: {{clientName}} / {{contactPerson}} ({{companyName}})

Application Reference: #{{appRef}}
Current Passport Expiry Date: {{expiryDate}}

During our automated passport compliance audit, our system identified a CRITICAL COMPLIANCE FAILURE:
Your passport expires in LESS THAN 6 MONTHS (180 days) from the requested entry date.

Under strict UAE Federal Law and ICAO International Civil Aviation standards:
• Immigration portals (GDRFA / ICP) will reject the application immediately.
• Airline departure desks will offload the passenger at airport check-in.

Immediate Remedy Options:
1. Urgent Passport Renewal: Renew your passport with your national passport office immediately.
2. Submit Renewed Passport Copy: Once renewed, send us the high-resolution bio page scan with at least 6 months validity.

Please confirm within 24 hours how you wish to proceed so we can hold your application from submission fees.

Urgent Desk,

{{senderName}}
Immigration Pre-Clearance Unit
{{agencyName}}`,
    bodyBn: `জরুরি নোটিশ: {{clientName}} / {{contactPerson}} ({{companyName}})

আবেদন রেফারেন্স: #{{appRef}}
পাসপোর্টের বর্তমান মেয়াদ শেষ: {{expiryDate}}

আমাদের স্বয়ংক্রিয় অডিটে দেখা গেছে যে আপনার পাসপোর্টের মেয়াদ ৬ মাসের (১৮০ দিন) কম রয়েছে।

সংযুক্ত আরব আমিরাতের কঠোর সরকারি আইন ও বিমান চলাচল নিয়ম অনুযায়ী:
• ইমিগ্রেশন পোর্টাল এই পাসপোর্ট দিয়ে ভিসা আবেদন গ্রহণ করবে না।
• এয়ারপোর্টে পৌঁছালে ইমিগ্রেশন ও এয়ারলাইন্স আপনাকে বিমানে উঠতে বাধা দেবে (Offloaded)।

করণীয় পদক্ষেপ:
১. জরুরি পাসপোর্ট নবায়ন: অবিলম্বে আপনার দেশের পাসপোর্ট অফিস থেকে পাসপোর্ট রিনিউ বা নতুন পাসপোর্ট সংগ্রহ করুন।
২. নতুন পাসপোর্টের স্ক্যান কপি প্রেরণ: নতুন পাসপোর্টের স্পষ্ট কপি আমাদের কাছে পাঠান যাতে আবেদন পুনরায় প্রস্তুত করা যায়।

সরকারি ফি নষ্ট হওয়া রোধ করতে আগামী ২৪ ঘণ্টার মধ্যে আপনার সিদ্ধান্ত জানান।

জরুরি হেল্পডেস্ক,

{{senderName}}
{{agencyName}}`
  },

  // 6. Typing Center Fee Protection & Zero Rejection Guarantee (B2B SaaS)
  {
    id: 'template-typing-center',
    category: 'typing_center',
    templateGroup: 'b2b_partnerships',
    badge: 'Typing & Amer',
    title: 'Typing Center Fee Protection & Zero Rejection Guarantee',
    titleBn: 'টাইপিং সেন্টারের সরকারি ফি সুরক্ষিত রাখার অফার',
    descriptionEn: 'Pitch typing and Amer centers on stopping AED 350+ rejection losses with automated 2-second pre-audit.',
    descriptionBn: 'টাইপিং সেন্টারে ভুল পাসপোর্ট বা ছবির জন্য সরকারি ফি লোকসান বন্ধ করার এআই অফার।',
    tags: ['Typing Center', 'Amer', 'AED 350 Loss', 'Zero Rejection', 'SaaS'],
    subject: 'Eliminate Typing Rejection Penalties (AED 350+) with UAE Visa AI Pre-Audit SaaS',
    subjectBn: 'টাইপিং সেন্টারের ৩৫০+ দিরহাম ফি লোকসান রোধে এআই পাসপোর্ট অডিট সফটওয়্যার পার্টনারশিপ',
    body: `Dear Typing Center Operations Team,

Every time a passport scan is rejected by GDRFA Dubai or ICP Smart Services due to unreadable MRZ data, glare, or sub-180-day validity, your center loses AED 350+ in non-refundable typing and service fees.

We would like to introduce you to Dubai & UAE Visa AI Hub (SaaS) — an enterprise compliance engine built specifically for UAE Typing Centers and Amer Desks:

Key Capabilities for Your Desk:
1. Instant 2-Second Passport OCR: Audits 6-Month validity, ICAO 9303 MRZ checksums, and bio-data.
2. Biometric Photo Validator: Verifies 80% face framing, strict white background (RGB 245+), and 0° head tilt.
3. Batch Processing: Drag & drop 20+ passports simultaneously with a consolidated compliance scorecard.
4. Auto-generated Client PDF Certificates: Issue official pre-clearance certificates to applicants before payment.
5. Zero Rejection Guarantee: Cut application returns by 99.4% before submitting to GDRFA/ICP.

Special B2B Agency Offer:
We invite your center to trial our SaaS with 100 free audited documents and white-labeled desk branding.

Would you be open to a 10-minute demonstration call this week?

Warm regards,

{{senderName}}
B2B Commercial Partnerships Desk
{{agencyName}}
Portal: https://dubai-visa-ai.app
WhatsApp Support: +971 50 123 4567`,
    bodyBn: `শ্রদ্ধেয় টাইপিং ও আমের সেন্টার ম্যানেজমেন্ট,

ইউএই জিডিআরএফএ (GDRFA Dubai) অথবা আইসিপি (ICP) পোর্টালে ঝাপসা পাসপোর্ট, ছবি ব্যাকগ্রাউন্ডের ক্রুটি বা ৬ মাসের কম মেয়াদের কারণে ভিসা রিজেক্ট হলে প্রতি ফাইলে ৩৫০ দিরহামের বেশি সরকারি ফি লোকসান হয়।

আমরা আপনাদের জন্য নিয়ে এসেছি "Dubai & UAE Visa AI Hub" — ইউএই সরকার অনুমোদিত নিয়মানুযায়ী স্বয়ংক্রিয় এআই অডিট সফটওয়্যার।

আমাদের সফটওয়্যার আপনার সেন্টারের যেভাবে কাজে আসবে:
১. মাত্র ২ সেকেন্ডে পাসপোর্ট অডিট: ৬ মাসের মেয়াদ নিয়ম ও আইসিএও এমআরজেড ত্রুটি শনাক্তকরণ।
২. বায়োমেট্রিক ফটো চেকার: আইসিএও স্ট্যান্ডার্ড সাদা ব্যাকগ্রাউন্ড ও ৮০% ফেস সাইজ যাচাই।
৩. ব্যাচ প্রসেসিং: একসাথে ২০ থেকে ৫০টি পাসপোর্ট ড্রপ করে এক ক্লিকে সম্পূর্ণ রেজাল্ট শিট ডাউনলোড।
৪. ফি সুরক্ষিত রাখা: ভুল ফাইল সাবমিট করার আগেই রিজেকশনের ঝুঁকি শূন্যে নামিয়ে আনা।

আপনার টাইপিং সেন্টারের জন্য আমরা ১০০টি ফ্রি অডিট ট্রায়াল ও বিশেষ বিটুবি পার্টনারশিপ ডিসকাউন্ট অফার করছি।

এ বিষয়ে বিস্তারিত আলোচনা করতে অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।

ধন্যবাদান্তে,

{{senderName}}
বিটুবি পার্টনারশিপ টিম
{{agencyName}}`
  },

  // 7. Travel Agency Bulk Visa Processing (B2B SaaS)
  {
    id: 'template-travel-agency',
    category: 'travel_agency',
    templateGroup: 'b2b_partnerships',
    badge: 'Travel Agencies',
    title: 'Travel Agency Bulk Visa Processing & Instant Status Alerts',
    titleBn: 'ট্রাভেল এজেন্সির জন্য বাল্ক ভিসা প্রসেসিং ও অটোমেটিক এলার্ট',
    descriptionEn: 'Pitch travel agencies on bulk group uploads, zero offloading risk, and automatic client notifications.',
    descriptionBn: 'ট্রাভেল এজেন্সির জন্য গ্রুপ পাসপোর্ট স্ক্যানিং ও ক্লায়েন্টদের স্বয়ংক্রিয় জিমেইল আপডেট পাঠানোর সুবিধা।',
    tags: ['Travel Agency', 'Bulk Passports', 'Tour Groups', 'Offloading'],
    subject: 'Scale Your Dubai Tourist Visa Volume with 100% GDRFA Pre-Compliance SaaS',
    subjectBn: 'আপনার ট্রাভেল এজেন্সির দুবাই ট্যুরিস্ট ভিসা প্রসেসিং দ্রুত করুন এআই সফটওয়্যার দিয়ে',
    body: `Dear Travel & Tourism Partner,

Handling dozens of Dubai tourist visas daily often leads to flight delays and ticket cancellations when passport validity or photo criteria are flagged at the eleventh hour.

Our platform, Dubai & UAE Visa AI Hub, empowers travel agencies to automate pre-submission compliance:

Why Travel Agencies Partner with Us:
• Bulk 50+ Passport Batch Auditor: Review an entire tour group's passports in under 60 seconds.
• Automated Client Status via Gmail & WhatsApp: Send automated branded visa approval receipts directly to travelers.
• Airport Offloading Prevention: 100% accurate 180-day countdown rules to ensure no client is denied boarding.
• Live GDRFA & ICP Status Tracker: Track submitted application stages directly from a unified dashboard.

We offer an exclusive Travel Agency Reseller Tier including sub-accounts for your booking agents and custom agency branding.

Let us know if you would like to activate your agency trial today.

Best regards,

{{senderName}}
Enterprise Travel Partnerships Team
{{agencyName}}
Website: https://dubai-visa-ai.app`,
    bodyBn: `শ্রদ্ধেয় ট্রাভেল এজেন্সি পার্টনার,

প্রতিদিন অসংখ্য দুবাই ট্যুরিস্ট ভিসা প্রসেসিং করার সময় শেষ মুহূর্তে পাসপোর্টের মেয়াদ বা ছবির ব্যাকগ্রাউন্ডের ভুলে ভিসা আটকে গেলে টিকিট ও ফ্লাইট শিডিউল ক্ষতিগ্রস্ত হয়।

আমাদের "Dubai & UAE Visa AI Hub" ট্রাভেল এজেন্সিগুলোর ভিসা ডিপার্টমেন্টকে সম্পূর্ণ ডিজিটাল ও স্বয়ংক্রিয় করে দেয়:

ট্রাভেল এজেন্সির জন্য বিশেষ সুবিধাসমূহ:
• একসাথে ৫০+ পাসপোর্ট ব্যাচ স্ক্যান: পুরো ট্যুর বা ফ্যামিলি গ্রুপের পাসপোর্ট ১ মিনিটে চেক।
• স্বয়ংক্রিয় ক্লায়েন্ট জিমেইল নোটিফিকেশন: ভিসা স্ট্যাটাস পরিবর্তনের সাথে সাথে ক্লায়েন্টের কাছে ব্র্যান্ডেড আপডেট প্রেরণ।
• অফলোডিং ঝুঁকি রোধ: ১৮০ দিনের ভ্যালিডিটি ক্যালকুলেশন যা এয়ারপোর্টে যাত্রী আটকানো রোধ করে।
• ইউনিফাইড ট্র্যাকিং: একই সাথে দুবাই জিডিআরএফএ এবং আইসিপি পোর্টালের স্ট্যাটাস চেক।

আপনার এজেন্সির জন্য আমরা বিশেষ সাব-এজেন্সি প্যানেল ও ট্রায়াল এক্সেস দিতে প্রস্তুত।

যোগাযোগের জন্য প্রস্তুত থাকলে আমাদের জানান।

ধন্যবাদ,

{{senderName}}
ট্রাভেল পার্টনারশিপ টিম
{{agencyName}}`
  },

  // 8. Manpower & Overseas Recruitment Pre-Clearance (B2B SaaS)
  {
    id: 'template-manpower-recruitment',
    category: 'manpower_recruitment',
    templateGroup: 'b2b_partnerships',
    badge: 'Manpower Agencies',
    title: 'Overseas Manpower & Worker Visa Pre-Clearance Suite',
    titleBn: 'ম্যানপাওয়ার এজেন্সির জন্য ওয়ার্কার ভিসা প্রি-অডিট স্যুট',
    descriptionEn: 'Pitch overseas recruitment agencies on high-volume worker batches, MRZ tampering checks, and dossier printouts.',
    descriptionBn: 'জনশক্তি রপ্তানি এজেন্সির জন্য শত শত কর্মীর পাসপোর্ট অডিট ও আইসিএও ভেরিফিকেশন।',
    tags: ['Manpower', 'Recruiting', 'Worker Visas', 'Embargo Prevention'],
    subject: 'Batch Passport Pre-Audit for UAE Employment & Worker Visas (Zero Embargo)',
    subjectBn: 'ইউএই ওয়ার্ক ও এমপ্লয়মেন্ট ভিসার জন্য ব্যাচ পাসপোর্ট প্রি-অডিট সফটওয়্যার পার্টনারশিপ',
    body: `Dear Overseas Recruitment Leadership,

Processing candidate worker visas for UAE construction, hospitality, and facilities contracts requires zero document errors. A single invalid passport or wrong photo background can trigger ministry rejections and delay entire manpower deployments.

The Dubai & UAE Visa AI Hub SaaS provides a dedicated Overseas Recruitment Suite:

Key Features for Manpower Agencies:
1. Batch Worker Dossier Ingestion: Upload entire candidate batches (50 to 200 passports at once).
2. Deep MRZ Extraction & Validation: Reads both Machine Readable Zones (Line 1 & 2) and catches handwritten/tampered passport discrepancies.
3. GDRFA 180-Day Rule Audit: Prevents sending candidates whose passports expire within the mandatory 6-month window.
4. Centralized Agency CRM: Assign candidate files to desk agents, track medical/typing stages, and print formatted biometric dossiers.

Partner with us to streamline your UAE manpower clearance with 99.8% first-pass accuracy.

We can schedule an online walkthrough for your deployment team this week.

Sincerely,

{{senderName}}
Manpower Division Alliances
{{agencyName}}
Contact: b2b@dubai-visa-ai.app`,
    bodyBn: `শ্রদ্ধেয় রিক্রুটিং ও ম্যানপাওয়ার এজেন্সি ম্যানেজমেন্ট,

সংযুক্ত আরব আমিরাতে জনশক্তি ও কর্মী প্রেরণের ক্ষেত্রে পাসপোর্টের ছোটখাটো ক্রুটি বা ছবির ভুলের কারণে মন্ত্রণালয়ে ফাইল আটকে গেলে পুরো ডিপ্লয়মেন্ট বিলম্বিত হয়।

আমাদের "Dubai & UAE Visa AI Hub" রিক্রুটিং এজেন্সির জন্য নিয়ে এসেছে বিশেষ এআই প্রি-অডিট সমাধান:

রিক্রুটিং এজেন্সির প্রধান সুবিধাসমূহ:
১. বাল্ক ক্যান্ডিডেট ব্যাচ অডিট: একসাথে ৫০ থেকে ২০০ জন প্রার্থীর পাসপোর্ট ড্রপ করে একবারে চেক।
২. আইসিএও এমআরজেড ডাটা ভেরিফিকেশন: নাম, জন্মতারিখ ও পাসপোর্ট নম্বরের গরমিল সাথে সাথে ধরা পড়ে।
৩. ১৮০ দিন মেয়াদ নিশ্চিতকরণ: বিমানে ওঠার আগে ও ভিসা লাগানোর সময় কোনো কর্মী যেন আটকে না যায়।
৪. সেন্ট্রাল ক্যান্ডিডেট ট্র্যাকিং: ফাইল স্ট্যাটাস ও ডকুমেন্ট হিস্ট্রি সুরক্ষিত রাখা।

আপনার এজেন্সির কাজের গতি দ্বিগুণ করতে ও রিজেকশন শূন্যে নামিয়ে আনতে আমাদের সাথে যুক্ত হোন।

ধন্যবাদান্তে,

{{senderName}}
ম্যানপাওয়ার পার্টনারশিপ উইং
{{agencyName}}`
  },

  // 9. Corporate PRO & Business Setup Investor Visa Automation (B2B SaaS)
  {
    id: 'template-corporate-pro',
    category: 'corporate_pro',
    templateGroup: 'b2b_partnerships',
    badge: 'Corporate PRO',
    title: 'Corporate PRO & Business Setup Investor Visa Automation',
    titleBn: 'কর্পোরেট পিআরও ও বিজনেস সেটআপ ফার্মের জন্য এআই অটোমেশন',
    descriptionEn: 'Pitch PRO consultants and law firms on Golden Visa calculation (AED 2M threshold) and executive reporting.',
    descriptionBn: 'দুবাইয়ের পিআরও ও বিজনেস সেটআপ ফার্মের জন্য গোল্ডেন ভিসা ক্যালকুলেটর ও এক্সিকিউটিভ রিপোর্ট।',
    tags: ['Corporate PRO', 'Golden Visa', 'Investors', 'Business Setup'],
    subject: 'Automate Corporate Investor & Employment Visa Dossiers with AI Intelligence',
    subjectBn: 'করপোরেট ইনভেস্টর ও এমপ্লয়মেন্ট ভিসা ডসিয়ার এআই এর মাধ্যমে দ্রুত সম্পন্ন করুন',
    body: `Dear Corporate Services Director,

For business setup consultancies and corporate PRO firms handling high-profile investors, executives, and enterprise staff across Dubai Mainland and Free Zones, client precision is paramount.

Dubai & UAE Visa AI Hub delivers a premium corporate visa infrastructure:

Why Corporate PROs Choose Our SaaS:
• Instant Golden Visa Eligibility Calculator: Calculate real estate equity (AED 2M threshold) and executive qualification in real time.
• Full Biometric Document Audit: Verify photos and passports against strict GDRFA and ICP guidelines.
• Multi-Client Agency CRM: Manage unlimited corporate dossiers with activity logs and version histories.
• Executive Client Reporting: Generate polished, branded PDF compliance audit certificates for C-level clients.

We invite your corporate advisory team to test our platform under an enterprise B2B retainer.

Please let us know your preferred time for a customized live demonstration.

Kind regards,

{{senderName}}
Corporate Alliances & VIP PRO Desk
{{agencyName}}`,
    bodyBn: `শ্রদ্ধেয় করপোরেট পিআরও ও বিজনেস সেটআপ ডিরেক্টর,

দুবাই মেইনল্যান্ড ও ফ্রি-জোনে কোম্পানি সেটআপ এবং ইনভেস্টর ও এমপ্লয়মেন্ট ভিসা দ্রুত ও নির্ভুলভাবে প্রসেসিং করার জন্য চাই নির্ভরযোগ্য অটোমেশন।

আমাদের প্ল্যাটফর্ম করপোরেট ফার্মগুলোর জন্য নিয়ে এসেছে সমন্বিত সমাধান:
• গোল্ডেন ভিসা ক্যালকুলেটর: ২ মিলিয়ন দিরহাম প্রপার্টি ও ৩০ হাজার দিরহাম বেতনের ক্রাইটেরিয়া তাৎক্ষণিক যাচাই।
• বায়োমেট্রিক ডকুমেন্ট অডিট: ক্লায়েন্টের ছবি ও পাসপোর্টের সম্পূর্ণ সরকারি স্পেক নিশ্চিতকরণ।
• করপোরেট ক্লায়েন্ট সিআরএম: একসাথে একাধিক ক্লায়েন্টের ফাইল ট্র্যাকিং ও হিস্ট্রি ব্যাকআপ।
• এক্সিকিউটিভ পিডিএফ সার্টিফিকেট: প্রতিটি অডিটের জন্য আন্তর্জাতিক মানের ব্র্যান্ডেড রিপোর্ট তৈরি।

আপনার টিমের জন্য একটি লাইভ ডেমো দেখার আমন্ত্রণ রইল।

শুভেচ্ছান্তে,

{{senderName}}
করপোরেট সলিউশনস টিম
{{agencyName}}`
  },

  // 10. White-Label SaaS Reseller & Sub-Agency Licensing (B2B SaaS)
  {
    id: 'template-whitelabel-reseller',
    category: 'all',
    templateGroup: 'b2b_partnerships',
    badge: 'White-Label SaaS',
    title: 'White-Label SaaS Reseller & Sub-Agency Licensing',
    titleBn: 'হোয়াইট-লেবেল এআই সফটওয়্যার রিসেলার ও নিজস্ব ব্র্যান্ডিং লাইসেন্স',
    descriptionEn: 'Empower agencies to resell under their custom domain, agency logo, and collect monthly recurring software revenue.',
    descriptionBn: 'এজেন্সির নিজস্ব ডোমেইন ও লোগো দিয়ে সফটওয়্যার চালু করে মাসিক সাবস্ক্রিপশন ফি আয়ের সুযোগ।',
    tags: ['White-Label', 'Reseller', 'Franchise', 'Custom Domain'],
    subject: 'Launch Your Own Branded Visa AI SaaS with 100% White-Label Reseller License',
    subjectBn: 'আপনার নিজস্ব ব্র্যান্ড ও লোগো দিয়ে ভিসা এআই সফটওয়্যার চালু করার অফার',
    body: `Dear Agency Executive,

Transform your visa agency into a technology provider by launching your own branded Visa AI & Pre-Audit Portal.

With our White-Label SaaS Partnership:
• Your Domain & Agency Branding: App runs under your agency URL (e.g., visa.youragency.com) with your logo and colors.
• Recurring Client Subscriptions: Charge sub-agencies and corporate clients monthly SaaS subscription fees.
• Full Feature Access: Passport OCR, Photo Auditor, Golden Visa Calculator, CRM, and GDRFA tracking.
• Complete Technical Maintenance: We handle cloud infrastructure, AI model updates, and 99.9% uptime.

Earn high-margin recurring software revenue alongside your regular visa typing fees.

Reply to this email to receive our Reseller Partner Information Deck and pricing tiers.

Best regards,

{{senderName}}
Global Partner Network
{{agencyName}}
Email: partners@dubai-visa-ai.app`,
    bodyBn: `শ্রদ্ধেয় এজেন্সি প্রধান,

আপনার ট্রাভেল বা টাইপিং এজেন্সিকে একটি আধুনিক সফটওয়্যার কোম্পানিতে রূপান্তর করুন। আমাদের হোয়াইট-লেবেল পার্টনারশিপের মাধ্যমে সম্পূর্ণ সফটওয়্যারটি আপনার নিজস্ব নাম ও লোগো দিয়ে ব্যবহার করতে পারবেন।

হোয়াইট-লেবেল সুবিধার মধ্যে রয়েছে:
• আপনার নিজস্ব ওয়েবসাইট ও ডোমেইন (যেমন visa.youragency.com)
• আপনার নিজস্ব লোগো ও ব্র্যান্ডিং
• সাব-এজেন্সি তৈরি করে প্রতি মাসে সাবস্ক্রিপশন ফি আয় করার সুযোগ
• ব্যাকএন্ড ক্লাউড ও এআই আপডেট আমরা পরিচালনা করব

বিস্তারিত পার্টনারশিপ প্যাকেজ জানতে আমাদের সাথে যোগাযোগ করুন।

ধন্যবাদান্তে,

{{senderName}}
গ্লোবাল পার্টনার নেটওয়ার্ক
{{agencyName}}`
  }
];
