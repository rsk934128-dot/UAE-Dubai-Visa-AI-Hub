import { VisaApplication, PassportAuditResult } from '../types';

/**
 * Utility to generate automated WhatsApp message templates and direct click-to-chat links
 * for clients and immigration agencies.
 */

export type WhatsAppStatusTemplateId = 
  | 'approved'
  | 'submitted'
  | 'passed'
  | 'flagged'
  | 'biometrics'
  | 'intake'
  | 'audit_report'
  | 'custom';

export interface WhatsAppAuditPayload {
  recipientPhone?: string; // e.g., '+971501234567' or '01712345678'
  applicantName: string;
  passportNumber: string;
  nationality?: string;
  visaType?: string;
  auditScore: number;
  isValid: boolean;
  validityRemainingDays?: number;
  statusText?: string;
  agencyName?: string;
  agentName?: string;
  urgency?: string;
  notes?: string;
  referenceId?: string;
  trackingUrl?: string;
  icpReferenceNo?: string;
}

export interface WhatsAppStatusTemplate {
  id: WhatsAppStatusTemplateId;
  nameEn: string;
  nameAr: string;
  nameBn: string;
  badge: string;
  iconName: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionBn: string;
  category: 'approval' | 'processing' | 'audit' | 'action' | 'appointment' | 'custom';
}

export const WHATSAPP_STATUS_TEMPLATES: WhatsAppStatusTemplate[] = [
  {
    id: 'approved',
    nameEn: 'Visa Approved & E-Visa Issued',
    nameAr: 'تمت الموافقة وإصدار التأشيرة الإلكترونية',
    nameBn: 'ভিসা অনুমোদিত ও ই-ভিসা প্রস্তুত',
    badge: 'Approved',
    iconName: 'CheckCircle2',
    descriptionEn: 'Official UAE entry permit approval notice with reference and collection instructions.',
    descriptionAr: 'إشعار رسمي بصدور إذن الدخول / التأشيرة الإلكترونية مع إرشادات السفر.',
    descriptionBn: 'ইউএই এন্ট্রি পারমিট অনুমোদন নোটিশ ও নির্দেশাবলী।',
    category: 'approval'
  },
  {
    id: 'submitted',
    nameEn: 'Submitted to GDRFA / ICP',
    nameAr: 'تم التقديم رسمياً إلى الإقامة والجنسية (GDRFA / ICP)',
    nameBn: 'জিডিআরএফএ / আইসিপি পোর্টালে জমা হয়েছে',
    badge: 'Under Review',
    iconName: 'Clock',
    descriptionEn: 'Notification that application has been submitted into official immigration review portal.',
    descriptionAr: 'إشعار بإحالة الطلب إلى التدقيق الحكومي النهائي في المنظومة الاتحادية.',
    descriptionBn: 'সরকারি ইমিগ্রেশন পোর্টালে পর্যালোচনার জন্য জমা দেওয়া হয়েছে।',
    category: 'processing'
  },
  {
    id: 'passed',
    nameEn: 'Passport & OCR Audit Cleared',
    nameAr: 'اجتياز فحص الجواز والتدقيق البيومتري',
    nameBn: 'পাসপোর্ট ও বায়োমেট্রিক অডিট সফল',
    badge: 'Passed',
    iconName: 'ShieldCheck',
    descriptionEn: 'Document verification passed with 100% ICAO Doc 9303 compliance & 6-month validity.',
    descriptionAr: 'تأكيد صحة بيانات الجواز ومطابقته لقاعدة الـ 6 أشهر والباركود البصري.',
    descriptionBn: 'পাসপোর্ট ৬ মাসের মেয়াদ ও আইসিএও মান অনুযায়ী যাচাই সম্পন্ন।',
    category: 'audit'
  },
  {
    id: 'flagged',
    nameEn: 'Action Required / Resubmission Needed',
    nameAr: 'مطلوب إجراء / تصحيح وثائق الجواز',
    nameBn: 'জরুরি পদক্ষেপ / নথি সংশোধন প্রয়োজন',
    badge: 'Action Required',
    iconName: 'AlertTriangle',
    descriptionEn: 'Urgent notice requesting client to renew passport or provide updated clear documents.',
    descriptionAr: 'تنبيه عاجل للعميل بضرورة تحديث الجواز أو إرفاق مستندات بديلة.',
    descriptionBn: 'পাসপোর্ট বা নথিপত্রে সমস্যা থাকায় সংশোধন প্রয়োজন।',
    category: 'action'
  },
  {
    id: 'biometrics',
    nameEn: 'Emirates ID & Medical Appointment',
    nameAr: 'الفحص الطبي والبصمات للهوية الإماراتية',
    nameBn: 'মেডিক্যাল টেস্ট ও এমিরেটস আইডি বায়োমেট্রিক্স',
    badge: 'Next Step',
    iconName: 'Building',
    descriptionEn: 'Instructions for attending UAE medical fitness centre and ICP biometric fingerprinting.',
    descriptionAr: 'إرشادات التوجه لمركز الطب الوقائي وتبصيم الهوية الإماراتية للمقيم الجديد.',
    descriptionBn: 'মেডিক্যাল ফিটনেস ও এমিরেটস আইডির জন্য বায়োমেট্রিক নির্দেশিকা।',
    category: 'appointment'
  },
  {
    id: 'intake',
    nameEn: 'Application Intake & File Initiated',
    nameAr: 'فتح الملف وبدء إجراءات التأشيرة',
    nameBn: 'আবেদন গ্রহণ ও ফাইল প্রস্তুত শুরু',
    badge: 'Initiated',
    iconName: 'FileText',
    descriptionEn: 'Confirmation of receipt, dedicated agency case officer, and tracking ID.',
    descriptionAr: 'تأكيد استلام الطلب وتعيين الموظف المسؤول ورقم المتابعة الداخلي.',
    descriptionBn: 'আবেদন গ্রহণ নিশ্চিতকরণ এবং কেস অফিসার বণ্টন সংক্রান্ত বার্তা।',
    category: 'processing'
  },
  {
    id: 'audit_report',
    nameEn: 'Full Passport Compliance Report',
    nameAr: 'تقرير الامتثال الشامل للجواز',
    nameBn: 'পূর্ণাঙ্গ পাসপোর্ট কমপ্লায়েন্স রিপোর্ট',
    badge: 'Audit Report',
    iconName: 'Scan',
    descriptionEn: 'Detailed multi-point breakdown of OCR score, MRZ match, and immigration rule check.',
    descriptionAr: 'تقرير تفصيلي بنتائج القراءة الآلية ونسبة المطابقة لاشتراطات الإقامة.',
    descriptionBn: 'বিস্তারিত ওসিআর স্কোর, এমআরজেড ম্যাচ এবং নিয়মানুগ রিপোর্ট।',
    category: 'audit'
  },
  {
    id: 'custom',
    nameEn: 'Custom Agency Status Alert',
    nameAr: 'رسالة تحديث مخصصة من الوكالة',
    nameBn: 'কাস্টম এজেন্সি স্ট্যাটাস বার্তা',
    badge: 'Custom',
    iconName: 'MessageSquare',
    descriptionEn: 'Send customized update with specific instructions, case reference, or payment link.',
    descriptionAr: 'إرسال ملاحظة خاصة ومباشرة من الوكيل مع تفاصيل المعاملة.',
    descriptionBn: 'এজেন্টের নিজস্ব নোট ও বিশেষ নির্দেশনাসহ কাস্টম বার্তা।',
    category: 'custom'
  }
];

/**
 * Automatically chooses the best template for a given application workflow status
 */
export function getRecommendedTemplateForStatus(status?: string): WhatsAppStatusTemplateId {
  if (!status) return 'intake';
  const s = status.toLowerCase();
  if (s.includes('approved')) return 'approved';
  if (s.includes('gdrfa') || s.includes('icp') || s.includes('submitted') || s.includes('process')) return 'submitted';
  if (s.includes('flagged') || s.includes('action') || s.includes('reject')) return 'flagged';
  if (s.includes('passed') || s.includes('verified')) return 'passed';
  if (s.includes('draft') || s.includes('new') || s.includes('intake')) return 'intake';
  return 'submitted';
}

/**
 * Cleans and formats phone number for international WhatsApp standard (digits only without + or spaces)
 */
export function sanitizeWhatsAppPhone(phone?: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  // Bangladesh numbers starting with 01 (11 digits: 017...)
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '880' + cleaned.substring(1);
  } else if (cleaned.startsWith('05') && cleaned.length === 10) {
    // UAE local mobile starting with 05 (050/052/054/055/056/058)
    cleaned = '971' + cleaned.substring(1);
  } else if (cleaned.startsWith('0') && cleaned.length === 11 && cleaned.startsWith('03')) {
    // Pakistan
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('0') && cleaned.length === 11 && (cleaned.startsWith('09') || cleaned.startsWith('08') || cleaned.startsWith('07'))) {
    // India
    cleaned = '91' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Human-friendly country code preview helper
 */
export function getPhoneCountryLabel(phone?: string): string {
  const sanitized = sanitizeWhatsAppPhone(phone);
  if (!sanitized) return '';
  if (sanitized.startsWith('971')) return '🇦🇪 UAE (+971)';
  if (sanitized.startsWith('880')) return '🇧🇩 Bangladesh (+880)';
  if (sanitized.startsWith('91')) return '🇮🇳 India (+91)';
  if (sanitized.startsWith('92')) return '🇵🇰 Pakistan (+92)';
  if (sanitized.startsWith('63')) return '🇵🇭 Philippines (+63)';
  if (sanitized.startsWith('20')) return '🇪🇬 Egypt (+20)';
  if (sanitized.startsWith('966')) return '🇸🇦 Saudi Arabia (+966)';
  if (sanitized.startsWith('44')) return '🇬🇧 United Kingdom (+44)';
  if (sanitized.startsWith('1')) return '🇺🇸 USA/Canada (+1)';
  return `🌐 +${sanitized.slice(0, 3)}...`;
}

/**
 * Generates automated WhatsApp message template for visa status updates
 */
export function generateWhatsAppStatusUpdateMessage(
  payload: WhatsAppAuditPayload,
  templateId: WhatsAppStatusTemplateId = 'approved',
  language: string = 'en',
  customNote?: string,
  trackingUrl?: string
): string {
  const agencyTitle = payload.agencyName || 'Dubai & UAE Visa Operations Hub 🇦🇪';
  const officerName = payload.agentName || 'Assigned Visa Officer';
  const portalUrl = trackingUrl || payload.trackingUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-jg7nym2ykn2gyrrotiqeia-234762684315.asia-southeast1.run.app');
  const refId = payload.referenceId || 'DXB-' + Math.floor(100000 + Math.random() * 900000);
  const passport = payload.passportNumber;
  const applicant = payload.applicantName;
  const visaType = payload.visaType || '30-Day Single Entry Tourist Visa';
  const score = payload.auditScore || 95;
  const validityDays = payload.validityRemainingDays !== undefined ? `${payload.validityRemainingDays} days` : 'Valid';
  const effectiveNotes = customNote || payload.notes;

  // ARABIC TEMPLATES
  if (language === 'ar') {
    switch (templateId) {
      case 'approved':
        return [
          `🎉 *تهانينا! تمت الموافقة على تأشيرة الإمارات* 🇦🇪`,
          `*الجهة المصدرة:* ${agencyTitle}`,
          `----------------------------------------`,
          `عزيزي/عزيزتي: *${applicant}*،`,
          `يسرنا إبلاغكم بصدور الموافقة الرسمية على إذن الدخول / التأشيرة الخاصة بكم بنجاح من الإدارة العامة للإقامة وشؤون الأجانب (GDRFA) والهيئة الاتحادية (ICP).`,
          ``,
          `📋 *تفاصيل المعاملة:*`,
          `• *رقم الملف / المرجع:* ${refId}`,
          `• *رقم الجواز:* ${passport}`,
          `• *نوع التأشيرة:* ${visaType}`,
          `• *حالة الطلب:* ✅ صدرت الموافقة الرسمية (Approved)`,
          `• *الموظف المتابع:* ${officerName}`,
          ``,
          effectiveNotes ? `📌 *ملاحظات إضافية:* ${effectiveNotes}\n` : '',
          `✈️ *الخطوات التالية:*`,
          `1. تم تجهيز ملف التأشيرة الإلكتروني (E-Visa PDF) وهو جاهز للتحميل والطباعة.`,
          `2. يرجى التأكد من مطابقة بيانات الجواز المطبوعة على إذن الدخول.`,
          `3. صلاحية الدخول تبدأ من تاريخ الإصدار الموضح في وثيقة التأشيرة.`,
          ``,
          `🌐 *بوابة متابعة الملف الرقمي:*`,
          `${portalUrl}`,
          `----------------------------------------`,
          `تحياتنا وتمنياتنا برحلة سعيدة وإقامة موفقة في دولة الإمارات! 🇦🇪`
        ].filter(Boolean).join('\n');

      case 'submitted':
        return [
          `⏳ *تحديث المعاملة: تم التقديم رسمياً إلى منظومة الهجرة* 🇦🇪`,
          `*المرجع:* ${agencyTitle}`,
          `----------------------------------------`,
          `عزيزي/عزيزتي: *${applicant}*،`,
          `نود إفادتكم بأنه تم إرسال ملف تأشيرتكم رسمياً بنجاح إلى النظام الاتحادي للإقامة وشؤون الأجانب بدبي (GDRFA / ICP) للتدقيق النهائي وإصدار التأشيرة.`,
          ``,
          `📌 *بيانات الطلب:*`,
          `• *رقم المرجع الحكومي:* ${refId}`,
          `• *رقم الجواز:* ${passport}`,
          `• *نوع التأشيرة:* ${visaType}`,
          `• *الحالة الحالية:* ⏳ قيد المراجعة الرسمية (Under Processing)`,
          `• *مستوى الأولوية:* ${payload.urgency || 'قياسي (Standard)'}`,
          ``,
          effectiveNotes ? `📝 *ملاحظات المتابعة:* ${effectiveNotes}\n` : '',
          `🛡️ *ما يجب فعله الآن:*`,
          `لا يتطلب منكم اتخاذ أي إجراء في الوقت الحالي. سنقوم بإشعاركم فور صدور الموافقة النهائية والتأشيرة مباشرة عبر واتساب.`,
          ``,
          `🌐 رابط التحقق والمتابعة: ${portalUrl}`
        ].filter(Boolean).join('\n');

      case 'passed':
        return [
          `✅ *اعتماد فحص الجواز والتدقيق البيومتري* 🇦🇪`,
          `*إشعار رسمي من:* ${agencyTitle}`,
          `----------------------------------------`,
          `المتقدم الكريم: *${applicant}*،`,
          `تم بنجاح استكمال الفحص الإلكتروني والتدقيق الذكي لجواز سفركم رقم *${passport}*. الجواز مستوفٍ لكافة الاشتراطات الفنية والقانونية وفقاً لمعايير منظمة الطيران المدني الدولي (ICAO Doc 9303) وقاعدة صلاحية الـ 6 أشهر.`,
          ``,
          `📊 *نتائج التدقيق والامتثال:*`,
          `• *درجة المطابقة الذكية:* ${score} / 100`,
          `• *صلاحية الجواز:* ✅ تزيد عن 6 أشهر (${validityDays})`,
          `• *مطابقة الباركود المقروء آلياً (MRZ):* ✅ متطابق 100%`,
          `• *الحالة:* جاهز للتقديم الفوري للتأشيرة`,
          ``,
          `الخطوة التالية: إحالة الملف إلى الهيئة الاتحادية للهوية والجنسية والجمارك.`,
          `🌐 البوابة: ${portalUrl}`
        ].filter(Boolean).join('\n');

      case 'flagged':
        return [
          `⚠️ *تنبيه عاجل: يلزم تحديث وثائق ملف التأشيرة* 🇦🇪`,
          `*صادر عن:* ${agencyTitle}`,
          `----------------------------------------`,
          `عزيزي/عزيزتي: *${applicant}*،`,
          `أثناء التدقيق والتحقق من ملف تأشيرتكم (رقم المرجع: ${refId})، تم رصد ملاحظات تتطلب تصحيحاً أو إعادة إرفاق مستند لتجنب رفض الطلب من قبل سلطات الهجرة.`,
          ``,
          `🔍 *سبب التنبيه والملاحظات:*`,
          `• *الملاحظة:* ${effectiveNotes || 'صلاحية الجواز أقل من 180 يوماً أو الصورة المرفقة غير واضحة المعالم.'}`,
          `• *رقم الجواز:* ${passport}`,
          `• *نوع التأشيرة المطلوب:* ${visaType}`,
          ``,
          `🚨 *الإجراء المطلوب:*`,
          `يرجى الرد على هذه الرسالة أو إرسال نسخة واضحة ومحدثة فوراً ليتسنى لنا متابعة المعاملة وإرسالها للنظام.`,
          ``,
          `📞 للاستفسار المباشر يرجى التواصل مع موظفكم المسؤول: ${officerName}`
        ].filter(Boolean).join('\n');

      case 'biometrics':
        return [
          `🏥 *تعليمات الفحص الطبي وتبصيم الهوية الإماراتية* 🇦🇪`,
          `*المكتب:* ${agencyTitle}`,
          `----------------------------------------`,
          `عزيزي/عزيزتي: *${applicant}*،`,
          `نرجو إحاطتكم علماً بالخطوة التالية لاستكمال إجراءات إقامتكم في دولة الإمارات:`,
          ``,
          `📍 *الخطوات الإلزامية:*`,
          `1. *الفحص الطبي الوقائي (Medical Fitness):* التوجه إلى أحد مراكز فحص اللياقة الطبية المعتمدة في الإمارة.`,
          `2. *التبصيم والتقاط الصورة:* التوجه إلى مركز سعادة المتعاملين التابع للهيئة الاتحادية (ICP) لتبصيم الهوية الإماراتية.`,
          ``,
          `📋 *المستندات المطلوبة:*`,
          `• أصل جواز السفر الساري (${passport})`,
          `• نسخة إذن الدخول / التأشيرة المعتمدة (رقم: ${refId})`,
          `• استمارة طلب الهوية المطبوعة`,
          ``,
          effectiveNotes ? `💡 *ملاحظات خاصة:* ${effectiveNotes}\n` : '',
          `🌐 للاستفسار والمساعدة: ${portalUrl}`
        ].filter(Boolean).join('\n');

      case 'intake':
        return [
          `📋 *تأكيد فتح الملف واستلام طلب التأشيرة* 🇦🇪`,
          `*المؤسسة:* ${agencyTitle}`,
          `----------------------------------------`,
          `مرحباً بك: *${applicant}*،`,
          `تم بنجاح فتح ملف تقديم التأشيرة الخاص بكم وبدء إجراءات التدقيق والتوثيق المعتمدة.`,
          ``,
          `📁 *بيانات الملف:*`,
          `• *رقم الملف التعريفي:* ${refId}`,
          `• *رقم الجواز:* ${passport}`,
          `• *النوع:* ${visaType}`,
          `• *المسؤول المباشر عن المعاملة:* ${officerName}`,
          ``,
          `سنوافيكم بتحديثات فورية في كل مرحلة من مراحل المعاملة عبر واتساب والبريد الإلكتروني.`,
          `🌐 البوابة: ${portalUrl}`
        ].filter(Boolean).join('\n');

      case 'custom':
        return [
          `📢 *تحديث بشأن معاملة التأشيرة - ${agencyTitle}* 🇦🇪`,
          `----------------------------------------`,
          `عزيزي/عزيزتي: *${applicant}*،`,
          `رقم الملف: ${refId} | رقم الجواز: ${passport}`,
          ``,
          `💬 *تفاصيل التحديث:*`,
          `${effectiveNotes || 'يرجى مراجعة حالة طلبكم وموافقتنا بالإجراءات المطلوبة.'}`,
          ``,
          `• *نوع التأشيرة:* ${visaType}`,
          `• *الموظف المسؤول:* ${officerName}`,
          `🌐 للمزيد من المعلومات: ${portalUrl}`
        ].filter(Boolean).join('\n');

      case 'audit_report':
      default:
        return generateWhatsAppAuditMessage(payload, 'ar');
    }
  }

  // BENGALI TEMPLATES (বাংলা)
  if (language === 'bn') {
    switch (templateId) {
      case 'approved':
        return [
          `🎉 *অভিনন্দন! আপনার দুবাই/ইউএই ভিসা অনুমোদিত হয়েছে* 🇦🇪`,
          `*ইস্যুকারী:* ${agencyTitle}`,
          `----------------------------------------`,
          `শ্রদ্ধেয় আবেদনকারী: *${applicant}*`,
          `আনন্দের সাথে জানানো যাচ্ছে যে আপনার সংযুক্ত আরব আমিরাতের ভিসা (রেফারেন্স: ${refId}) ইমিগ্রেশন কর্তৃপক্ষ (GDRFA/ICP) কর্তৃক সফলভাবে অনুমোদিত (Approved) হয়েছে।`,
          ``,
          `📋 *ভিসা ফাইলের বিবরণ:*`,
          `• *ফাইল রেফারেন্স:* ${refId}`,
          `• *পাসপোর্ট নম্বর:* ${passport}`,
          `• *ভিসার ধরন:* ${visaType}`,
          `• *বর্তমান অবস্থা:* ✅ Approved (অনুমোদিত)`,
          `• *দায়িত্বপ্রাপ্ত ভিসা অফিসার:* ${officerName}`,
          ``,
          effectiveNotes ? `📌 *জরুরি নোট:* ${effectiveNotes}\n` : '',
          `✈️ *পরবর্তী করণীয়:*`,
          `১. আপনার ই-ভিসা (E-Visa PDF) প্রস্তুত রয়েছে, ডাউনলোড বা প্রিন্ট করে নিন।`,
          `২. ফ্লাইটের পূর্বে পাসপোর্টের নামের বানান ও তথ্য ভিসার সাথে মিলিয়ে নিন।`,
          ``,
          `🌐 *অনলাইন ট্র্যাকিং পোর্টাল:*`,
          `${portalUrl}`,
          `----------------------------------------`,
          `আপনার নিরাপদ ও আনন্দময় ইউএই ভ্রমণের শুভকামনায়! 🇦🇪`
        ].filter(Boolean).join('\n');

      case 'submitted':
        return [
          `⏳ *ভিসা আপডেট: ইমিগ্রেশন পোর্টালে জমা সম্পন্ন* 🇦🇪`,
          `*এজেন্সি:* ${agencyTitle}`,
          `----------------------------------------`,
          `প্রিয় *${applicant}*,`,
          `আপনার ভিসা আবেদন ফাইলটি চূড়ান্ত অনুমোদন ও ইস্যুর জন্য সরকারি ইমিগ্রেশন পোর্টালে (GDRFA/ICP) সফলভাবে জমা দেওয়া হয়েছে।`,
          ``,
          `📋 *আবেদনের বিবরণ:*`,
          `• *রেফারেন্স নম্বর:* ${refId}`,
          `• *পাসপোর্ট:* ${passport}`,
          `• *ভিসা ক্যাটাগরি:* ${visaType}`,
          `• *বর্তমান স্ট্যাটাস:* ⏳ ইন-প্রসেস / পর্যালোচনায় আছে`,
          ``,
          effectiveNotes ? `📝 *নোট:* ${effectiveNotes}\n` : '',
          `🛡️ আপনার আপাতত কোনো পদক্ষেপ নেওয়া লাগবে না। ভিসা ইস্যু হওয়ামাত্রই আমরা আপনাকে সরাসরি হোয়াটসঅ্যাপে জানিয়ে দেব।`,
          `🌐 পোর্টাল লিঙ্ক: ${portalUrl}`
        ].filter(Boolean).join('\n');

      case 'passed':
        return [
          `✅ *পাসপোর্ট ও বায়োমেট্রিক অডিট সফল* 🇦🇪`,
          `*অফিসিয়াল নোটিশ:* ${agencyTitle}`,
          `----------------------------------------`,
          `প্রিয় *${applicant}*,`,
          `আপনার পাসপোর্ট (${passport}) এর কৃত্রিম বুদ্ধিমত্তা চালিত অডিট সফল হয়েছে। এটি ইউএই ইমিগ্রেশনের ৬ মাসের মেয়াদ ও আইসিএও ডক ৯৩০৩ এর সকল নিয়মনীতি পূর্ণ করেছে।`,
          ``,
          `📊 *অডিট ফলাফল:*`,
          `• *কমপ্লায়েন্স স্কোর:* ${score} / 100`,
          `• *পাসপোর্ট মেয়াদ:* ✅ ৬ মাসের অধিক বৈধ (${validityDays})`,
          `• *মেশিন রিডেবল কোড (MRZ):* ✅ শতভাগ সঠিক`,
          `• *স্ট্যাটাস:* সরকারি পোর্টালে জমার জন্য প্রস্তুত`,
          ``,
          `🌐 বিস্তারিত ফাইল দেখুন: ${portalUrl}`
        ].filter(Boolean).join('\n');

      case 'flagged':
        return [
          `⚠️ *জরুরি নোটিশ: পাসপোর্টের তথ্য সংশোধন প্রয়োজন* 🇦🇪`,
          `*এজেন্সি:* ${agencyTitle}`,
          `----------------------------------------`,
          `প্রিয় *${applicant}*,`,
          `আপনার ভিসা আবেদন পর্যালোচনা করার সময় কিছু তথ্যে ত্রুটি বা সংশোধনের প্রয়োজন দেখা দিয়েছে যাতে ইমিগ্রেশনে ফাইলটি বাতিল না হয়।`,
          ``,
          `🔍 *প্রয়োজনীয় সংশোধন:*`,
          `• *সমস্যা:* ${effectiveNotes || 'পাসপোর্টের মেয়াদ ৬ মাসের কম অথবা ছবি/ডকুমেন্ট পরিষ্কার নয়।' }`,
          `• *পাসপোর্ট:* ${passport}`,
          `• *ভিসার ধরন:* ${visaType}`,
          ``,
          `🚨 অনুগ্রহ করে দ্রুত আমাদের সাথে যোগাযোগ করুন বা সঠিক কপিটি পাঠান।`,
          `📞 যোগাযোগ: ${officerName}`
        ].filter(Boolean).join('\n');

      case 'biometrics':
        return [
          `🏥 *মেডিক্যাল ও এমিরেটস আইডি বায়োমেট্রিক নির্দেশিকা* 🇦🇪`,
          `*এজেন্সি:* ${agencyTitle}`,
          `----------------------------------------`,
          `প্রিয় *${applicant}*,`,
          `আপনার ইউএই রেসিডেন্সির পরবর্তী আবশ্যক ধাপগুলো নিচে তুলে ধরা হলো:`,
          ``,
          `📍 *আবশ্যক পদক্ষেপ:*`,
          `১. *মেডিক্যাল ফিটনেস টেস্ট:* অনুমোদিত প্রতিরোধমূলক চিকিৎসা কেন্দ্রে রক্ত পরীক্ষা ও এক্স-রে সম্পন্ন করুন।`,
          `২. *এমিরেটস আইডি বায়োমেট্রিক্স:* নির্ধারিত আইসিপি কাস্টমার হ্যাপিনেস সেন্টারে গিয়ে ফিঙ্গারপ্রিন্ট দিন।`,
          ``,
          `📋 সাথে রাখবেন: মূল পাসপোর্ট (${passport}), অনুমোদিত এন্ট্রি পারমিট কপি (${refId})।`,
          effectiveNotes ? `💡 *বিশেষ পরামর্শ:* ${effectiveNotes}\n` : '',
          `🌐 সহায়তা পোর্টাল: ${portalUrl}`
        ].filter(Boolean).join('\n');

      case 'intake':
        return [
          `📋 *ভিসা আবেদন গ্রহণ ও ফাইল তৈরি সম্পন্ন* 🇦🇪`,
          `*এজেন্সি:* ${agencyTitle}`,
          `----------------------------------------`,
          `স্বাগতম *${applicant}*,`,
          `আমাদের এজেন্সিতে আপনার ভিসা আবেদন সফলভাবে নথিভুক্ত করা হয়েছে।`,
          `• *ফাইল আইডি:* ${refId}`,
          `• *পাসপোর্ট:* ${passport}`,
          `• *ভিসার ধরন:* ${visaType}`,
          `• *দায়িত্বপ্রাপ্ত ভিসা অফিসার:* ${officerName}`,
          ``,
          `ফাইলটির প্রতিটি অগ্রগতির আপডেট আপনি এই হোয়াটসঅ্যাপে পাবেন।`,
          `🌐 ট্র্যাকিং পোর্টাল: ${portalUrl}`
        ].filter(Boolean).join('\n');

      case 'custom':
        return [
          `📢 *ভিসা ফাইল সম্পর্কিত আপডেট - ${agencyTitle}* 🇦🇪`,
          `----------------------------------------`,
          `প্রিয় *${applicant}*,`,
          `ফাইল রেফারেন্স: ${refId} | পাসপোর্ট: ${passport}`,
          ``,
          `💬 *বার্তা:*`,
          `${effectiveNotes || 'আপনার ফাইল প্রক্রিয়াকরণ চলছে। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।'}`,
          ``,
          `• *দায়িত্বপ্রাপ্ত অফিসার:* ${officerName}`,
          `🌐 পোর্টাল: ${portalUrl}`
        ].filter(Boolean).join('\n');

      case 'audit_report':
      default:
        return generateWhatsAppAuditMessage(payload, 'bn');
    }
  }

  // ENGLISH / INTERNATIONAL TEMPLATES (DEFAULT)
  switch (templateId) {
    case 'approved':
      return [
        `🎉 *UAE VISA APPROVED & E-VISA ISSUED* 🇦🇪`,
        `*Issued by:* ${agencyTitle}`,
        `----------------------------------------`,
        `Dear *${applicant}*,`,
        `We are thrilled to inform you that your official UAE entry permit / visa application has been APPROVED by immigration authorities (GDRFA Dubai / Federal ICP)!`,
        ``,
        `📋 *OFFICIAL DOSSIER DETAILS:*`,
        `• *Application Reference:* ${refId}`,
        `• *Passport Number:* ${passport}`,
        `• *Visa Category:* ${visaType}`,
        `• *Status:* ✅ APPROVED & CLEARED`,
        `• *Assigned Officer:* ${officerName}`,
        ``,
        effectiveNotes ? `📌 *Officer Remarks:* ${effectiveNotes}\n` : '',
        `✈️ *NEXT STEPS FOR TRAVEL:*`,
        `1. Your official electronic visa (E-Visa PDF) is generated and ready.`,
        `2. Please carry a printed copy of the E-Visa alongside your physical passport when boarding.`,
        `3. Verify that your passport validity extends at least 6 months past your travel date.`,
        ``,
        `🌐 *Digital Dossier & E-Visa Access:*`,
        `${portalUrl}`,
        `----------------------------------------`,
        `We wish you a pleasant journey and welcome to the United Arab Emirates! 🇦🇪`
      ].filter(Boolean).join('\n');

    case 'submitted':
      return [
        `⏳ *VISA STATUS UPDATE: SUBMITTED TO IMMIGRATION* 🇦🇪`,
        `*Authority Portal:* GDRFA Dubai & Federal ICP Review`,
        `*Issued by:* ${agencyTitle}`,
        `----------------------------------------`,
        `Dear *${applicant}*,`,
        `Your visa file has been officially registered and lodged with UAE immigration authorities for processing.`,
        ``,
        `📋 *APPLICATION RECORD:*`,
        `• *Government Case ID:* ${refId}`,
        `• *Passport Number:* ${passport}`,
        `• *Visa Type:* ${visaType}`,
        `• *Status:* ⏳ Under Official Review (In Process)`,
        `• *Processing Priority:* ${payload.urgency || 'Standard'}`,
        `• *Case Officer:* ${officerName}`,
        ``,
        effectiveNotes ? `📝 *Status Notes:* ${effectiveNotes}\n` : '',
        `🛡️ *ACTION REQUIRED:*`,
        `No action is needed from your side at this stage. Our operations team is continuously monitoring your file queue. You will receive an instant notification as soon as the approval is granted.`,
        ``,
        `🌐 *Live Tracker:* ${portalUrl}`
      ].filter(Boolean).join('\n');

    case 'passed':
      return [
        `✅ *PRE-SUBMISSION PASSPORT & BIOMETRIC AUDIT CLEARED* 🇦🇪`,
        `*Agency Compliance Division:* ${agencyTitle}`,
        `----------------------------------------`,
        `Dear *${applicant}*,`,
        `Your passport (No: *${passport}*) has passed automated pre-submission screening with flying colors! It meets 100% of UAE ICP & Dubai GDRFA immigration rules.`,
        ``,
        `📊 *AUDIT BENCHMARK RESULTS:*`,
        `• *AI Compliance Score:* ${score} / 100`,
        `• *6-Month Expiry Rule:* ✅ Passed (${validityDays} validity)`,
        `• *ICAO Doc 9303 MRZ Match:* ✅ 100% Checksum Valid`,
        `• *Readiness:* Ready for Immediate Immigration Lodgment`,
        ``,
        effectiveNotes ? `📝 *Compliance Notes:* ${effectiveNotes}\n` : '',
        `Next Step: Filing into the Federal Immigration Smart Systems.`,
        `🌐 Portal: ${portalUrl}`
      ].filter(Boolean).join('\n');

    case 'flagged':
      return [
        `⚠️ *URGENT ACTION REQUIRED: VISA DOSSIER RECTIFICATION* 🇦🇪`,
        `*Issued by:* ${agencyTitle}`,
        `----------------------------------------`,
        `Dear *${applicant}*,`,
        `During the compliance audit of your visa application (File: ${refId}), our immigration systems detected an issue that requires your prompt attention to avoid visa rejection.`,
        ``,
        `🔍 *FLAGGED ITEMS & ACTION NEEDED:*`,
        `• *Issue:* ${effectiveNotes || 'Passport validity is below 180 days or scanned bio-data page has reflection/blur.'}`,
        `• *Passport Number:* ${passport}`,
        `• *Visa Category:* ${visaType}`,
        ``,
        `🚨 *NEXT STEPS:*`,
        `Please reply to this message directly or contact your assigned case officer *${officerName}* immediately with the updated clear document.`,
        ``,
        `🌐 *Portal Upload:* ${portalUrl}`
      ].filter(Boolean).join('\n');

    case 'biometrics':
      return [
        `🏥 *EMIRATES ID BIOMETRICS & MEDICAL FITNESS APPOINTMENT* 🇦🇪`,
        `*Operations Desk:* ${agencyTitle}`,
        `----------------------------------------`,
        `Dear *${applicant}*,`,
        `Your entry permit has cleared initial processing. Please follow the required protocol for the next residency steps:`,
        ``,
        `📍 *MANDATORY INSTRUCTIONS:*`,
        `1. *Medical Fitness Examination:* Visit your allocated preventive health centre in Dubai/UAE for blood test and chest X-ray.`,
        `2. *Emirates ID Biometrics:* Proceed to the designated ICP Customer Happiness Centre for fingerprint biometrics and iris capture.`,
        ``,
        `📋 *DOCUMENTS TO CARRY:*`,
        `• Original valid passport (${passport})`,
        `• Printed Approved Entry Permit (File: ${refId})`,
        `• 2 recent white-background passport-sized photographs`,
        ``,
        effectiveNotes ? `💡 *Special Instructions:* ${effectiveNotes}\n` : '',
        `🌐 Need assistance? Visit ${portalUrl}`
      ].filter(Boolean).join('\n');

    case 'intake':
      return [
        `📋 *APPLICATION INTAKE & FILE INITIATION CONFIRMED* 🇦🇪`,
        `*Agency:* ${agencyTitle}`,
        `----------------------------------------`,
        `Dear *${applicant}*,`,
        `Thank you for choosing ${agencyTitle}. Your UAE visa application has been officially registered in our agency workflow.`,
        ``,
        `📁 *YOUR FILE RECORD:*`,
        `• *Reference ID:* ${refId}`,
        `• *Passport Number:* ${passport}`,
        `• *Visa Type:* ${visaType}`,
        `• *Assigned Officer:* ${officerName}`,
        ``,
        effectiveNotes ? `📝 *Intake Remarks:* ${effectiveNotes}\n` : '',
        `Our team is now initiating the pre-submission audits and biometric verification. You will receive milestone updates via this WhatsApp chat.`,
        ``,
        `🌐 *Check Status:* ${portalUrl}`
      ].filter(Boolean).join('\n');

    case 'custom':
      return [
        `📢 *VISA APPLICATION STATUS UPDATE - ${agencyTitle}* 🇦🇪`,
        `----------------------------------------`,
        `Dear *${applicant}*,`,
        `Reference ID: ${refId} | Passport No: ${passport}`,
        ``,
        `💬 *Message from Visa Desk:*`,
        `${effectiveNotes || 'Your application is progressing through our agency workflow. Please reach out if you have any questions.'}`,
        ``,
        `• *Visa Type:* ${visaType}`,
        `• *Officer:* ${officerName}`,
        `🌐 Tracker: ${portalUrl}`
      ].filter(Boolean).join('\n');

    case 'audit_report':
    default:
      return generateWhatsAppAuditMessage(payload, 'en');
  }
}

/**
 * Creates professional bilingual / English WhatsApp text for passport audit report
 */
export function generateWhatsAppAuditMessage(payload: WhatsAppAuditPayload, language: string = 'en'): string {
  const isArabic = language === 'ar';
  const isBengali = language === 'bn';
  const agencyTitle = payload.agencyName || 'UAE & Dubai Visa AI Hub';
  const statusEmoji = payload.isValid ? '✅' : '⚠️';
  const daysText = payload.validityRemainingDays !== undefined 
    ? `${payload.validityRemainingDays} days remaining` 
    : 'Audited';

  if (isArabic) {
    const verdictText = payload.isValid 
      ? 'مؤهل ومعتمد لتقديم التأشيرة (Passed)' 
      : 'يحتاج إلى تصحيح أو تجديد (Flagged)';
    return [
      `*تقرير تدقيق جواز السفر والتأشيرة - ${agencyTitle}* 🇦🇪`,
      `----------------------------------------`,
      `👤 *اسم المتقدم:* ${payload.applicantName}`,
      `🛂 *رقم الجواز:* ${payload.passportNumber}`,
      payload.nationality ? `🌍 *الجنسية:* ${payload.nationality}` : '',
      payload.visaType ? `📋 *نوع المعاملة:* ${payload.visaType}` : '',
      payload.referenceId ? `🔖 *رقم الملف:* ${payload.referenceId}` : '',
      ``,
      `*نتيجة التدقيق والامتثال:*`,
      `${statusEmoji} *الحالة:* ${verdictText}`,
      `📊 *درجة المطابقة الذكية:* ${payload.auditScore} / 100`,
      payload.validityRemainingDays !== undefined ? `⏳ *صلاحية الجواز (قاعدة الـ 6 أشهر):* ${daysText}` : '',
      payload.notes ? `\n📝 *ملاحظات:* ${payload.notes}` : '',
      ``,
      `----------------------------------------`,
      `📌 *ملاحظة رسمية:* تم فحص هذا الجواز إلكترونياً وفق معايير ICAO Doc 9303 واشتراطات الإقامة وشؤون الأجانب (GDRFA) والهيئة الاتحادية (ICP).`,
      `🌐 رابط المنظومة: ${typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-jg7nym2ykn2gyrrotiqeia-234762684315.asia-southeast1.run.app'}`
    ].filter(Boolean).join('\n');
  }

  if (isBengali) {
    const verdictText = payload.isValid 
      ? 'ভিসা আবেদনের জন্য উপযোগী (Passed)' 
      : 'সংশোধন প্রয়োজন (Action Required)';
    return [
      `*পাসপোর্ট ও ভিসা প্রি-সাবমিশন অডিট রিপোর্ট - ${agencyTitle}* 🇦🇪`,
      `----------------------------------------`,
      `👤 *আবেদনকারী:* ${payload.applicantName}`,
      `🛂 *পাসপোর্ট নম্বর:* ${payload.passportNumber}`,
      payload.nationality ? `🌍 *জাতীয়তা:* ${payload.nationality}` : '',
      payload.visaType ? `📋 *ভিসা ক্যাটাগরি:* ${payload.visaType}` : '',
      payload.referenceId ? `🔖 *ফাইল রেফারেন্স:* ${payload.referenceId}` : '',
      ``,
      `*অডিট ও কমপ্লায়েন্স ফলাফল:*`,
      `${statusEmoji} *ফলাফল:* ${verdictText}`,
      `📊 *এআই স্কোর:* ${payload.auditScore} / 100`,
      payload.validityRemainingDays !== undefined ? `⏳ *পাসপোর্ট ১৮০-দিনের মেয়াদ:* ${daysText}` : '',
      payload.statusText ? `📌 *বর্তমান অবস্থা:* ${payload.statusText}` : '',
      payload.notes ? `\n📝 *এজেন্সি মন্তব্য:* ${payload.notes}` : '',
      ``,
      `----------------------------------------`,
      `🛡️ *মানদণ্ড:* ইউএই আইসিপি ও দুবাই জিডিআরএফএ ইমিগ্রেশন বিধিমালা এবং আইসিএও ডক ৯৩০৩ অনুযায়ী অডিট সম্পন্ন।`,
      `🌐 *পোর্টাল:* ${typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-jg7nym2ykn2gyrrotiqeia-234762684315.asia-southeast1.run.app'}`
    ].filter(Boolean).join('\n');
  }

  // Default English / International format
  const verdictText = payload.isValid 
    ? 'PASSED: Dubai & UAE Immigration Compliant' 
    : 'FLAGGED: Action / Rectification Required';

  return [
    `*PASSPORT & VISA PRE-SUBMISSION AUDIT REPORT* 🇦🇪`,
    `*Issued by:* ${agencyTitle}`,
    `----------------------------------------`,
    `👤 *Applicant:* ${payload.applicantName}`,
    `🛂 *Passport No:* ${payload.passportNumber}`,
    payload.nationality ? `🌍 *Nationality:* ${payload.nationality}` : '',
    payload.visaType ? `📋 *Application Type:* ${payload.visaType}` : '',
    payload.referenceId ? `🔖 *Reference ID:* ${payload.referenceId}` : '',
    ``,
    `*AUDIT & COMPLIANCE VERDICT:*`,
    `${statusEmoji} *Verdict:* ${verdictText}`,
    `📊 *AI Compliance Score:* ${payload.auditScore} / 100`,
    payload.validityRemainingDays !== undefined ? `⏳ *Passport 180-Day Rule:* ${daysText}` : '',
    payload.statusText ? `📌 *Current Status:* ${payload.statusText}` : '',
    payload.notes ? `\n📝 *Agency Remarks:* ${payload.notes}` : '',
    ``,
    `----------------------------------------`,
    `🛡️ *Official Standards:* Pre-screened against UAE Federal ICP & Dubai GDRFA immigration rules (ICAO Doc 9303 MRZ & 6-Month Passport Expiry requirement).`,
    `🌐 *Agency Portal:* ${typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-jg7nym2ykn2gyrrotiqeia-234762684315.asia-southeast1.run.app'}`
  ].filter(Boolean).join('\n');
}

/**
 * Creates a direct wa.me link with encoded text
 */
export function createWhatsAppShareUrl(
  payload: WhatsAppAuditPayload, 
  language: string = 'en',
  templateId?: WhatsAppStatusTemplateId,
  customNote?: string,
  trackingUrl?: string
): string {
  const phone = sanitizeWhatsAppPhone(payload.recipientPhone);
  const text = templateId 
    ? generateWhatsAppStatusUpdateMessage(payload, templateId, language, customNote, trackingUrl)
    : generateWhatsAppAuditMessage(payload, language);
  const encoded = encodeURIComponent(text);
  
  if (phone) {
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`;
  }
  return `https://api.whatsapp.com/send?text=${encoded}`;
}

/**
 * Helper to extract payload from VisaApplication
 */
export function getWhatsAppPayloadFromApplication(app: VisaApplication, agencyName?: string): WhatsAppAuditPayload {
  const audit = app.passportAudit;
  const score = audit?.overallScore || (app.status === 'Approved' || app.status === 'Audited - Passed' ? 95 : 65);
  const isValid = app.status === 'Approved' || app.status === 'Audited - Passed' || (audit ? audit.isValid : true);
  
  return {
    recipientPhone: app.contactPhone,
    applicantName: app.applicantName,
    passportNumber: app.passportNumber,
    nationality: app.nationality,
    visaType: app.visaType,
    auditScore: score,
    isValid,
    validityRemainingDays: audit?.validationChecks?.validityRemainingDays,
    statusText: app.status,
    agencyName,
    agentName: app.assignedAgent,
    urgency: app.urgency,
    notes: app.notes,
    referenceId: app.id
  };
}

/**
 * Helper to extract payload from PassportAuditResult
 */
export function getWhatsAppPayloadFromAuditResult(
  result: PassportAuditResult, 
  recipientPhone?: string, 
  agencyName?: string
): WhatsAppAuditPayload {
  return {
    recipientPhone,
    applicantName: result.extractedData.fullName || 'Applicant',
    passportNumber: result.extractedData.passportNumber || 'N/A',
    nationality: result.extractedData.nationality,
    auditScore: result.overallScore,
    isValid: result.isValid,
    validityRemainingDays: result.validationChecks.validityRemainingDays,
    statusText: result.isValid ? 'Approved for Submission' : 'Rectification Required',
    agencyName,
    notes: result.rejectionReasons?.length ? result.rejectionReasons.join('; ') : result.suggestions?.join('; ')
  };
}
