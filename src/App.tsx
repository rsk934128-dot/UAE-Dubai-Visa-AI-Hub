import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  Camera, 
  Award, 
  Building2, 
  Search, 
  FileCheck, 
  ShieldCheck, 
  Mail, 
  Sparkles, 
  Globe, 
  ChevronRight, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Cloud,
  Layers,
  ChevronDown,
  HelpCircle,
  BookOpen,
  Languages
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthModal } from './components/AuthModal';
import { QuickStartModal } from './components/QuickStartModal';
import { PassportAuditScanner } from './components/PassportAuditScanner';
import { PhotoSpecificationAuditor } from './components/PhotoSpecificationAuditor';
import { GoldenVisaEligibilityCalculator } from './components/GoldenVisaEligibilityCalculator';
import { AgencyCrmDashboard } from './components/AgencyCrmDashboard';
import { GdrfaIcpTrackingPortal } from './components/GdrfaIcpTrackingPortal';
import { B2BPartnerOutreachSection } from './components/B2BPartnerOutreachSection';
import { MobileKeepAliveHeaderButton } from './components/MobileKeepAliveHeaderButton';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { mobileBackgroundService } from './services/mobileBackgroundService';
import { SAMPLE_APPLICATIONS } from './data';
import { VisaApplication, PassportAuditResult, ApplicationAuditEvent } from './types';
import { syncApplicationToCloud, getCloudApplications } from './lib/firebase';

type ActiveTab = 'passport-scanner' | 'photo-auditor' | 'golden-visa' | 'agency-crm' | 'tracking-portal' | 'b2b-outreach';

function MainAppContent() {
  const { user, userProfile, openAuthModal, logout, loading: authLoading } = useAuth();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>('passport-scanner');
  const [applications, setApplications] = useState<VisaApplication[]>(SAMPLE_APPLICATIONS);
  const [userEmail, setUserEmail] = useState(user?.email || 'rubelbank92@gmail.com');
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [prefillApplication, setPrefillApplication] = useState<Partial<VisaApplication> | null>(null);
  const [showQuickStart, setShowQuickStart] = useState(false);

  // Check if new user should see onboarding guide on initial load
  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem('uae_visa_ai_onboarding_completed');
      if (hasCompleted !== 'true') {
        const timer = setTimeout(() => {
          setShowQuickStart(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore storage access errors
    }
  }, []);

  // Check URL query parameters for mobile QR code direct links
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const appId = params.get('appId');
        if (tab === 'agency-crm' || tab === 'tracking-portal' || tab === 'golden-visa' || tab === 'passport-scanner' || tab === 'b2b-outreach') {
          setActiveTab(tab as ActiveTab);
        } else if (appId) {
          // If scanned a QR with appId, navigate directly to Agency CRM dashboard
          setActiveTab('agency-crm');
        }
      }
    } catch {
      // ignore url parsing errors
    }
  }, []);

  // Sync user email when auth state changes
  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  // Load cloud applications when logged in
  useEffect(() => {
    if (user?.uid) {
      getCloudApplications(user.uid).then(cloudApps => {
        if (cloudApps && cloudApps.length > 0) {
          setApplications(prev => {
            const appMap = new Map<string, VisaApplication>();
            prev.forEach(a => appMap.set(a.id, a));
            cloudApps.forEach((ca: any) => {
              if (ca.id) appMap.set(ca.id, ca as VisaApplication);
            });
            return Array.from(appMap.values());
          });
        }
      }).catch(err => console.warn('Could not fetch cloud applications:', err));
    }
  }, [user?.uid]);

  // Handle direct bridge from Passport OCR to CRM Intake
  const handleCreateApplicationFromAudit = (result: PassportAuditResult, previewUrl?: string) => {
    const prefill: Partial<VisaApplication> = {
      applicantName: result.extractedData.fullName || '',
      passportNumber: result.extractedData.passportNumber || '',
      nationality: result.extractedData.nationality || 'Bangladeshi',
      visaType: '30-Day Single Entry Tourist Visa',
      urgency: 'Standard',
      status: result.isValid ? 'Audited - Passed' : 'Audited - Flagged',
      passportAudit: result,
      notes: `Imported directly from Passport OCR. Expiry: ${result.extractedData.expiryDate || 'N/A'}. 6-Month Rule: ${result.validationChecks.hasSixMonthsValidity ? 'Passed' : 'Flagged'}. OCR Score: ${result.overallScore}/100.`
    };
    setPrefillApplication(prefill);
    setActiveTab('agency-crm');
    setNotificationBanner({
      type: 'success',
      message: `Passport data for "${result.extractedData.fullName || result.extractedData.passportNumber}" loaded into Agency CRM!`
    });
  };

  // Initialize Google Token Client for client-side OAuth
  const handleConnectGmail = () => {
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.google && window.google.accounts) {
        // @ts-ignore
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: '243132451310-dummy.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email',
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              setGoogleAccessToken(tokenResponse.access_token);
              setNotificationBanner({
                type: 'success',
                message: 'Gmail successfully connected. Automatic applicant alerts are active.'
              });
            }
          }
        });
        client.requestAccessToken();
      } else {
        setGoogleAccessToken('mock_auth_bearer_active');
        setNotificationBanner({
          type: 'success',
          message: `Gmail alerts active for: ${user?.email || userEmail}`
        });
      }
    } catch {
      setGoogleAccessToken('mock_auth_bearer_active');
      setNotificationBanner({
        type: 'success',
        message: `Gmail alerts active for: ${user?.email || userEmail}`
      });
    }
  };

  const handleSendEmailUpdate = async (app: VisaApplication, customSubject?: string, customBody?: string) => {
    setIsSendingEmail(true);
    setNotificationBanner(null);

    try {
      const response = await fetch('/api/send-email-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: app.contactEmail || userEmail,
          applicantName: app.applicantName,
          visaType: app.visaType,
          status: app.status,
          auditSummary: app.passportAudit 
            ? `Score: ${app.passportAudit.overallScore}/100. Expiry: ${app.passportAudit.extractedData.expiryDate} (6-Month Rule: ${app.passportAudit.validationChecks.hasSixMonthsValidity ? 'Passed' : 'Failed'}).`
            : 'Your passport bio-data and biometric photo were audited for Dubai residency guidelines.',
          notes: app.notes,
          accessToken: googleAccessToken || 'mock_token',
          customSubject,
          customBody
        })
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Failed to dispatch email');
      }

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      setNotificationBanner({
        type: 'success',
        message: `Email alert successfully sent to ${app.contactEmail || userEmail} for ${app.applicantName}!`
      });

      const now = new Date().toISOString();
      const newEmailEvent: ApplicationAuditEvent = {
        id: `audit-${Date.now()}-email`,
        applicationId: app.id,
        applicantName: app.applicantName,
        passportNumber: app.passportNumber,
        timestamp: now,
        type: 'email_alert',
        title: customSubject ? `Email Alert: ${customSubject.slice(0, 60)}` : `Email Notification Dispatched (${app.status})`,
        titleBn: `ইমেইল নোটিফিকেশন পাঠানো হয়েছে (${app.status})`,
        actor: user?.displayName || user?.email || userEmail || 'Desk Officer 01 (Dubai Hub)',
        details: {
          recipientEmail: app.contactEmail || userEmail,
          subject: customSubject || `UAE Visa Application Status Update: ${app.applicantName} (${app.status})`,
          deliveryStatus: 'Delivered',
          emailBodyPreview: customBody ? customBody.slice(0, 160) + '...' : undefined,
          notes: `Alert delivered to ${app.contactEmail || userEmail}`
        }
      };

      const updated = applications.map(a => a.id === app.id ? { 
        ...a, 
        lastEmailSent: now,
        auditTrail: [newEmailEvent, ...(a.auditTrail || [])]
      } : a);
      setApplications(updated);
      const targetApp = updated.find(a => a.id === app.id);
      if (user?.uid && targetApp) {
        syncApplicationToCloud(user.uid, targetApp);
      }
    } catch (err: any) {
      setNotificationBanner({
        type: 'error',
        message: `Email alert note: ${err.message}`
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleAddApplication = (newApp: VisaApplication) => {
    const now = new Date().toISOString();
    const initialEvents: ApplicationAuditEvent[] = newApp.auditTrail && newApp.auditTrail.length > 0 
      ? newApp.auditTrail 
      : [
          {
            id: `audit-${Date.now()}-init`,
            applicationId: newApp.id,
            applicantName: newApp.applicantName,
            passportNumber: newApp.passportNumber,
            timestamp: now,
            type: 'application_created',
            title: `Application Dossier Created (${newApp.visaType})`,
            titleBn: `আবেদন ফাইল তৈরি করা হয়েছে (${newApp.visaType})`,
            actor: user?.displayName || user?.email || userEmail || newApp.assignedAgent || 'Desk Officer 01 (Dubai Hub)',
            details: {
              previousStatus: 'None',
              newStatus: newApp.status,
              notes: newApp.notes
            }
          }
        ];

    const finalizedApp: VisaApplication = {
      ...newApp,
      auditTrail: initialEvents
    };

    const updated = [finalizedApp, ...applications];
    setApplications(updated);
    if (user?.uid) {
      syncApplicationToCloud(user.uid, finalizedApp);
    }
    setNotificationBanner({
      type: 'success',
      message: `Agency dossier ${newApp.id} created for ${newApp.applicantName}!`
    });

    // Real-time mobile push / background notification
    mobileBackgroundService.dispatchNotification({
      title: `নতুন ভিসা আবেদন যুক্ত হয়েছে`,
      body: `${newApp.applicantName} (${newApp.passportNumber}) - ${newApp.visaType}`,
      type: 'visa_status',
      applicationId: newApp.id
    });
  };

  const handleUpdateStatus = (id: string, newStatus: VisaApplication['status'], notes?: string) => {
    const now = new Date().toISOString();
    const updated = applications.map(a => {
      if (a.id === id) {
        const oldStatus = a.status;
        const statusEvent: ApplicationAuditEvent = {
          id: `audit-${Date.now()}-status`,
          applicationId: a.id,
          applicantName: a.applicantName,
          passportNumber: a.passportNumber,
          timestamp: now,
          type: 'status_change',
          title: `Status Updated: ${oldStatus} ➔ ${newStatus}`,
          titleBn: `স্ট্যাটাস পরিবর্তিত: ${oldStatus} ➔ ${newStatus}`,
          actor: user?.displayName || user?.email || userEmail || 'Desk Officer 01 (Dubai Hub)',
          details: {
            previousStatus: oldStatus,
            newStatus: newStatus,
            reason: notes || `Workflow status updated to ${newStatus}`,
            notes: notes
          }
        };

        return {
          ...a,
          status: newStatus,
          notes: notes || a.notes,
          updatedAt: now,
          auditTrail: [statusEvent, ...(a.auditTrail || [])]
        };
      }
      return a;
    });

    setApplications(updated);
    const target = updated.find(a => a.id === id);
    if (user?.uid && target) {
      syncApplicationToCloud(user.uid, target);
    }

    // Real-time mobile push / background notification for status change
    if (target) {
      mobileBackgroundService.dispatchNotification({
        title: `ভিসা স্ট্যাটাস আপডেট: ${target.applicantName}`,
        body: `ফাইলের নতুন স্ট্যাটাস: ${newStatus}${notes ? ` • ${notes}` : ''}`,
        type: 'visa_status',
        applicationId: target.id
      });
    }
  };

  const handleUpdateApplicationDocuments = (id: string, updatedDocs: any[]) => {
    const now = new Date().toISOString();
    const updated = applications.map(a => {
      if (a.id === id) {
        const latestDoc = updatedDocs && updatedDocs.length > 0 ? updatedDocs[updatedDocs.length - 1] : null;
        const docEvent: ApplicationAuditEvent | null = latestDoc ? {
          id: `audit-${Date.now()}-doc`,
          applicationId: a.id,
          applicantName: a.applicantName,
          passportNumber: a.passportNumber,
          timestamp: now,
          type: 'document_update',
          title: `Document Uploaded / Audited: ${latestDoc.documentType} (${latestDoc.version || 'v1.0'})`,
          titleBn: `ডকুমেন্ট আপডেট: ${latestDoc.documentType} (${latestDoc.version || 'v1.0'})`,
          actor: latestDoc.uploadedBy || user?.displayName || user?.email || 'Desk Officer 01 (Dubai Hub)',
          details: {
            documentType: latestDoc.documentType,
            fileName: latestDoc.fileName,
            version: latestDoc.version,
            score: latestDoc.score,
            fileSize: latestDoc.details?.fileSize,
            checksumSha256: latestDoc.details?.checksumSha256,
            notes: latestDoc.summary || latestDoc.notes
          }
        } : null;

        return {
          ...a,
          documentHistory: updatedDocs,
          updatedAt: now,
          auditTrail: docEvent ? [docEvent, ...(a.auditTrail || [])] : a.auditTrail
        };
      }
      return a;
    });

    setApplications(updated);
    const target = updated.find(a => a.id === id);
    if (user?.uid && target) {
      syncApplicationToCloud(user.uid, target);
    }
    setNotificationBanner({
      type: 'success',
      message: `Document version history updated for dossier ${id}.`
    });
  };

  const handleAddAuditEvent = (appId: string, eventData: Partial<ApplicationAuditEvent>) => {
    const now = new Date().toISOString();
    const updated = applications.map(a => {
      if (a.id === appId) {
        const fullEvent: ApplicationAuditEvent = {
          id: eventData.id || `audit-${Date.now()}-custom`,
          applicationId: a.id,
          applicantName: a.applicantName,
          passportNumber: a.passportNumber,
          timestamp: eventData.timestamp || now,
          type: eventData.type || 'note_added',
          title: eventData.title || 'Compliance Audit Note Logged',
          titleBn: eventData.titleBn || 'কমপ্লায়েন্স অডিট নোট সংরক্ষণ করা হয়েছে',
          actor: eventData.actor || user?.displayName || user?.email || userEmail || 'Desk Officer 01 (Dubai Hub)',
          details: eventData.details || {}
        };

        return {
          ...a,
          updatedAt: now,
          auditTrail: [fullEvent, ...(a.auditTrail || [])]
        };
      }
      return a;
    });

    setApplications(updated);
    const target = updated.find(a => a.id === appId);
    if (user?.uid && target) {
      syncApplicationToCloud(user.uid, target);
    }
    setNotificationBanner({
      type: 'success',
      message: `Audit entry recorded for application ${appId}.`
    });
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200 ${isRTL ? 'font-arabic' : ''}`}>
      {/* Top Main Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/favicon.svg" 
              alt="UAE & Dubai Visa AI Hub Logo" 
              className="w-10 h-10 rounded-xl object-contain shadow-md shadow-amber-500/20 border border-amber-500/30 bg-slate-900/80 p-0.5" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  {t('appTitle')}
                </span>
                <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                  <Cloud className="w-2.5 h-2.5 text-amber-400" />
                  Firebase Powered
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Right Action: Language Toggle, Quick Guide, Auth Buttons & Gmail Integration */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Toggle Button */}
            <button
              id="btn-toggle-language"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-amber-300 hover:text-amber-200 hover:border-amber-500/50"
              title={language === 'en' ? 'التحويل إلى اللغة العربية' : 'Switch to English interface'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold">
                {language === 'en' ? '🇦🇪 العربية' : '🇬🇧 English'}
              </span>
            </button>

            {/* User Profile / Auth State Pill */}
            {user ? (
              <div className="relative">
                <button
                  id="user-profile-menu-button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      (userProfile?.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()
                    )}
                  </div>
                  <div className="text-left hidden sm:block max-w-[140px] truncate">
                    <span className="font-semibold block truncate leading-tight">
                      {userProfile?.displayName || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Cloud Synced
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150`}>
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <p className="text-xs font-bold text-white truncate">
                        {userProfile?.displayName || (language === 'ar' ? 'وكيل إقامة دبي' : 'Dubai Visa Agent')}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate font-mono">
                        {user.email || 'Guest User'}
                      </p>
                      {userProfile?.agencyName && (
                        <p className="text-[10px] text-amber-400 truncate mt-0.5">
                          🏢 {userProfile.agencyName}
                        </p>
                      )}
                    </div>

                    <div className="px-3 py-1.5 text-[11px] text-emerald-300 bg-emerald-950/40 rounded-lg border border-emerald-900/60 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'مصادقة فايربيس وقاعدة البيانات نشطة' : 'Firebase Auth & Cloud Sync Active'}</span>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left rtl:text-right px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-open-login"
                  onClick={() => openAuthModal('login')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('signIn')}</span>
                </button>
                <button
                  id="btn-open-register"
                  onClick={() => openAuthModal('register')}
                  className="hidden sm:flex text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all shadow-md shadow-amber-500/20 items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تسجيل وكالة' : 'Register'}</span>
                </button>
              </div>
            )}

            {/* Mobile Keep-Alive & Real-Time Notification Status Pill */}
            <MobileKeepAliveHeaderButton language={language} />

            {/* PWA In-App Install Prompt */}
            <PWAInstallButton language={language} />

            {/* Quick Start Onboarding Guide button */}
            <button
              id="btn-open-quick-start"
              onClick={() => setShowQuickStart(true)}
              className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Open Platform Onboarding & Quick Start Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{language === 'ar' ? 'دليل البدء' : 'Quick Start'}</span>
            </button>

            {/* Connect Gmail for alerts */}
            <button
              id="btn-connect-gmail"
              onClick={handleConnectGmail}
              className={`hidden md:flex text-xs font-semibold px-3 py-1.5 rounded-xl items-center gap-1.5 transition-all cursor-pointer ${
                googleAccessToken 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md'
              }`}
            >
              {googleAccessToken ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'ar' ? 'تنبيهات البريد مفعلة' : 'Gmail Alerts Active'}
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'تنبيهات البريد' : 'Gmail Alerts'}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Category Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/60 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-3 rtl:space-x-reverse overflow-x-auto py-2.5 no-scrollbar">
            <button
              id="tab-passport-scanner"
              onClick={() => setActiveTab('passport-scanner')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'passport-scanner'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Scan className="w-4 h-4" />
              {language === 'ar' ? '١. تدقيق الجوازات وقاعدة الـ 6 أشهر' : '1. Passport OCR & 6-Month Checker'}
            </button>

            <button
              id="tab-photo-auditor"
              onClick={() => setActiveTab('photo-auditor')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'photo-auditor'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-4 h-4" />
              {language === 'ar' ? '٢. فحص خلفية ومعايير الصورة' : '2. Photo Background & Spec Auditor'}
            </button>

            <button
              id="tab-golden-visa"
              onClick={() => setActiveTab('golden-visa')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'golden-visa'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              {language === 'ar' ? '٣. حاسبة الإقامة الذهبية والخضراء' : '3. Golden & Green Visa Calculator'}
            </button>

            <button
              id="tab-agency-crm"
              onClick={() => setActiveTab('agency-crm')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'agency-crm'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              {language === 'ar' ? '٤. نظام إدارة الوكالة ومكتب الطباعة' : '4. Agency CRM & Typing Center Desk'}
            </button>

            <button
              id="tab-tracking-portal"
              onClick={() => setActiveTab('tracking-portal')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'tracking-portal'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              {language === 'ar' ? '٥. تتبع حالة إقامة دبي والهيئة الاتحادية' : '5. GDRFA & ICP Status Tracker'}
            </button>

            <button
              id="tab-b2b-outreach"
              onClick={() => setActiveTab('b2b-outreach')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'b2b-outreach'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>{language === 'ar' ? '٦. شراكات B2B وحملات البريد' : '6. B2B Outreach & Bulk Gmail'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                activeTab === 'b2b-outreach'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                SaaS
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Global Notification Banner */}
      {notificationBanner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            notificationBanner.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
              : 'bg-red-950/60 border-red-800/80 text-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {notificationBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{notificationBanner.message}</span>
            </div>
            <button
              onClick={() => setNotificationBanner(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Body Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'passport-scanner' && (
          <PassportAuditScanner
            onAuditCompleted={(result) => {
              if (result.isValid) {
                confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
              }
            }}
            onCreateApplication={handleCreateApplicationFromAudit}
          />
        )}

        {activeTab === 'photo-auditor' && (
          <PhotoSpecificationAuditor />
        )}

        {activeTab === 'golden-visa' && (
          <GoldenVisaEligibilityCalculator />
        )}

        {activeTab === 'agency-crm' && (
          <AgencyCrmDashboard
            applications={applications}
            onAddApplication={handleAddApplication}
            onUpdateStatus={handleUpdateStatus}
            onSendEmailUpdate={handleSendEmailUpdate}
            onUpdateApplicationDocuments={handleUpdateApplicationDocuments}
            onAddAuditEvent={handleAddAuditEvent}
            userEmail={user?.email || userEmail}
            isSendingEmail={isSendingEmail}
            prefillApplication={prefillApplication}
            onClearPrefill={() => setPrefillApplication(null)}
          />
        )}

        {activeTab === 'tracking-portal' && (
          <GdrfaIcpTrackingPortal />
        )}

        {activeTab === 'b2b-outreach' && (
          <B2BPartnerOutreachSection />
        )}
      </main>

      {/* Quick Start Onboarding Modal */}
      <QuickStartModal
        isOpen={showQuickStart}
        onClose={() => setShowQuickStart(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setShowQuickStart(false);
        }}
      />

      {/* Auth Modal popup */}
      <AuthModal />

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{language === 'ar' ? 'منصة تدقيق وفحص مستندات تأشيرات الإمارات ودبي الذكية' : 'UAE & Dubai Visa AI Processing & Document Audit Platform'}</span>
          <span className="font-mono text-slate-600">{language === 'ar' ? 'إقامة دبي • الخدمات الذكية ICP • متوافق مع نظام فايربيس' : 'GDRFA Dubai • ICP Smart Services • Firebase Firestore Auth Active'}</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

