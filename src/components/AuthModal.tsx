import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Building, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    loginAnonymously,
    resetPassword 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(authModalMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode when modal opens
  React.useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
    }
    setError(null);
    setSuccessMsg(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) throw new Error('অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন।');
        await loginWithEmail(email, password);
      } else if (mode === 'register') {
        if (!email || !password) throw new Error('অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন।');
        if (password.length < 6) throw new Error('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।');
        await registerWithEmail(email, password, name, agencyName);
      } else if (mode === 'forgot') {
        if (!email) throw new Error('অনুগ্রহ করে আপনার রেজিস্টার্ড ইমেইল প্রদান করুন।');
        await resetPassword(email);
        setSuccessMsg('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।');
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'অথেন্টিকেশনে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'এই ইমেইল দিয়ে ইতোমধ্যে একটি একাউন্ট খোলা আছে। অনুগ্রহ করে লগইন করুন।';
      } else if (err.code === 'auth/weak-password') {
        msg = 'পাসওয়ার্ড আরও শক্তিশালী করুন (কমপক্ষে ৬ ডিজিট)।';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'সঠিক ইমেইল ফরম্যাট প্রদান করুন।';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google সাইন-ইন উইন্ডো বন্ধ করা হয়েছে।');
      } else if (err.code === 'auth/popup-blocked') {
        setError('ব্রাউজার পপআপ ব্লক করেছে। অনুগ্রহ করে ইমেইল দিয়ে লগইন করুন।');
      } else {
        setError(err.message || 'Google দিয়ে লগইন করা যায়নি। ইমেইল ব্যবহার করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAnonymously();
    } catch (err: any) {
      setError(err.message || 'গেস্ট মোড চালু করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {mode === 'login' && 'ইউজার লগইন (Sign In)'}
                {mode === 'register' && 'নতুন একাউন্ট রেজিস্ট্রেশন (Sign Up)'}
                {mode === 'forgot' && 'পাসওয়ার্ড পুনরুদ্ধার (Password Reset)'}
              </h3>
              <p className="text-xs text-amber-300/80 font-sans">
                GDRFA ও ICP ভিসা অডিট ডাটা ক্লাউডে সুরক্ষিত রাখুন
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers: Login vs Register */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/60 border-b border-slate-800 text-xs">
            <button
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              লগইন (Sign In)
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              রেজিস্ট্রেশন (Sign Up)
            </button>
          </div>
        )}

        {/* Main Form Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    আপনার পূর্ণ নাম (Full Name)
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Md Rubel Hossain"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    ট্রাভেল এজেন্সি / টাইপিং সেন্টারের নাম (Agency Name - ঐচ্ছিক)
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Dubai Smart Typing & Travels"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                ইমেইল এড্রেস (Email Address)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300 font-medium">
                    পাসওয়ার্ড (Password)
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); setSuccessMsg(null); }}
                      className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>প্রসেসিং হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'লগইন করুন (Sign In)'}
                    {mode === 'register' && 'একাউন্ট তৈরি করুন (Create Account)'}
                    {mode === 'forgot' && 'রিসেট লিংক পাঠান (Send Reset Link)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                ← লগইন স্ক্রিনে ফিরে যান
              </button>
            </div>
          )}

          {/* Social / Alternative Logins */}
          {mode !== 'forgot' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-slate-900 px-2 text-slate-500 font-mono">
                    অথবা বিকল্প মাধ্যম
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Google Login
                </button>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={loading}
                  className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-medium"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  গেস্ট মোড (Guest)
                </button>
              </div>
            </>
          )}

          {/* Cloud Auto-Backup Note */}
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>লগইন করলে আপনার সকল পাসপোর্ট অডিট ও CRM ফাইল ক্লাউডে সুরক্ষিত থাকবে।</span>
          </div>
        </div>
      </div>
    </div>
  );
};
