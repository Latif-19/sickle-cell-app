import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StitchHeader } from './components/stitch/StitchHeader';
import { StitchBottomNav } from './components/stitch/StitchBottomNav';
import type { ScreenTab } from './components/stitch/StitchBottomNav';
import { StitchDashboardScreen } from './components/stitch/StitchDashboardScreen';
import { StitchCalculatorScreen } from './components/stitch/StitchCalculatorScreen';
import { StitchFaqScreen } from './components/stitch/StitchFaqScreen';
import { StitchAuthScreen } from './components/stitch/StitchAuthScreen';
import { StitchProfessionalsModal } from './components/stitch/StitchProfessionalsModal';
import { StitchProviderDashboard } from './components/stitch/StitchProviderDashboard';
import { QuizCard } from './components/QuizCard';
import { QuizHistory } from './components/QuizHistory';
import { Icon } from './components/ui/Icon';

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ScreenTab>('dashboard');
  const [quizSubTab, setQuizSubTab] = useState<'take' | 'history'>('take');
  const [isProfessionalsModalOpen, setIsProfessionalsModalOpen] = useState(false);
  const [rbacAlert, setRbacAlert] = useState<string | null>(null);

  // Initialize and synchronize with browser URL & history
  useEffect(() => {
    if (loading || !user) return;

    const handleLocation = () => {
      const path = window.location.pathname;
      if (path === '/provider-dashboard') {
        if (profile?.role === 'user') {
          setRbacAlert('Access Restricted: Healthcare Professional credentials required for Provider Workspace. Redirected to patient dashboard.');
          setActiveTab('dashboard');
          window.history.replaceState({}, '', '/');
          setTimeout(() => setRbacAlert(null), 5000);
        } else {
          setActiveTab('provider-dashboard');
        }
      }
    };

    handleLocation();
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, [profile?.role, loading, user]);

  // Role-based redirect on login, signup, or profile role switch
  useEffect(() => {
    if (loading || !user) return;

    if (profile?.role === 'professional') {
      // Clinician logged in: auto-redirect to provider dashboard if on home or auth
      if (activeTab === 'dashboard' || activeTab === 'auth') {
        setActiveTab('provider-dashboard');
        window.history.pushState({}, '', '/provider-dashboard');
      }
    } else if (profile?.role === 'user') {
      // Standard user: ensure they cannot stay on /provider-dashboard
      if (activeTab === 'provider-dashboard') {
        setRbacAlert('Healthcare Professional credentials required. Redirected to patient dashboard.');
        setActiveTab('dashboard');
        window.history.pushState({}, '', '/');
        setTimeout(() => setRbacAlert(null), 5000);
      }
    }
  }, [profile?.role, loading, user]);

  const handleTabChange = (tab: ScreenTab) => {
    if (tab === 'provider-dashboard') {
      if (profile?.role !== 'professional') {
        setRbacAlert('Access Restricted: Provider Dashboard is reserved for verified Clinicians. Sign in with a professional account.');
        setActiveTab('auth');
        window.history.pushState({}, '', '/');
        setTimeout(() => setRbacAlert(null), 5000);
        return;
      }
      setActiveTab('provider-dashboard');
      window.history.pushState({}, '', '/provider-dashboard');
    } else {
      setActiveTab(tab);
      window.history.pushState({}, '', '/');
    }
  };

  // 1. Loading State: Clean Clinical Progress Spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-14 h-14 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <div className="flex flex-col gap-1 items-center">
          <div className="flex items-center gap-2">
            <img src="/stitch-logo.png" alt="SCT Decision Tool" className="h-7 w-auto object-contain" />
            <span className="font-headline-sm font-extrabold text-on-surface">SCT Decision Tool</span>
          </div>
          <p className="text-on-surface-variant font-label-md text-xs sm:text-sm">
            Verifying secure session & clinical permissions...
          </p>
        </div>
      </div>
    );
  }

  // 2. Authentication Gate: Unauthenticated visitors cannot access dashboard or clinical tools
  if (!user) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-on-surface">
        {/* Minimal Clinical Header for Unauthenticated State */}
        <header className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-variant/50 shadow-sm">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/stitch-logo.png"
                alt="SCT Decision Tool Logo"
                className="h-10 sm:h-11 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-headline-md text-[18px] sm:text-[19px] text-on-surface leading-tight font-extrabold tracking-tight">
                  SCT Decision Tool
                </span>
                <span className="font-label-sm text-[10px] sm:text-[11px] text-on-surface-variant tracking-wider uppercase font-semibold">
                  Clinical Genetics & Family Planning
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Centered Auth Screen ONLY - Zero Dashboard / Zero Tools Exposed */}
        <main className="flex-1 w-full flex flex-col justify-center">
          <StitchAuthScreen
            onSuccess={() => {
              if (profile?.role === 'professional') {
                setActiveTab('provider-dashboard');
              } else {
                setActiveTab('dashboard');
              }
            }}
          />
        </main>

        {/* Secure Footer */}
        <footer className="w-full border-t border-surface-variant/50 bg-surface-container-low/50 py-6">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="font-bold text-on-surface">SCT Decision Tool</span>
              <span>— Clinical Genetics & Family Planning</span>
            </div>
            <div className="flex items-center gap-4 font-medium">
              <span>Ghana Data Protection Act (Act 843) • Private & Secure</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // 3. Authenticated Application: Full access to Dashboard, Calculator, Quiz, and Provider Workspace

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-on-surface">
      {/* Modern Desktop Top Navbar */}
      <StitchHeader
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenProfessionals={() => setIsProfessionalsModalOpen(true)}
      />

      {/* RBAC Route Guard Banner */}
      {rbacAlert && (
        <div className="w-full bg-amber-500 text-on-surface font-label-md text-xs sm:text-sm py-2.5 px-4 text-center font-bold flex items-center justify-center gap-2 shadow-sm animate-in slide-in-from-top-2">
          <Icon name="security" className="w-4 h-4 text-on-surface" size={18} />
          <span>{rbacAlert}</span>
        </div>
      )}

      {/* Main Content View with Desktop Responsive Bounds and Bottom Dock Clearance */}
      <main className="flex-1 w-full flex flex-col pb-28 sm:pb-32">
        {/* Tab: Provider Dashboard (Dedicated Clinical Interface) */}
        {activeTab === 'provider-dashboard' && (
          <StitchProviderDashboard
            onSwitchToPatientView={() => handleTabChange('dashboard')}
            onOpenCliniciansDirectory={() => setIsProfessionalsModalOpen(true)}
          />
        )}

        {/* Tab 1: Dashboard & Action Plan */}
        {activeTab === 'dashboard' && (
          <StitchDashboardScreen
            onNavigateToCalculator={() => handleTabChange('calculator')}
            onNavigateToLearn={() => handleTabChange('education')}
            onNavigateToQuiz={() => handleTabChange('quiz')}
            onOpenProfessionals={() => setIsProfessionalsModalOpen(true)}
          />
        )}

        {/* Tab 2: Interactive Genotype Inheritance Calculator */}
        {activeTab === 'calculator' && (
          <StitchCalculatorScreen />
        )}

        {/* Tab 3: Educational FAQs & Clinical Companion */}
        {activeTab === 'education' && (
          <StitchFaqScreen
            onNavigateToCalculator={() => setActiveTab('calculator')}
            onNavigateToQuiz={() => setActiveTab('quiz')}
          />
        )}

        {/* Tab 4: Sickle Cell Assessment Quiz & Supabase Quiz_Scores History */}
        {activeTab === 'quiz' && (
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-surface-variant/40 pb-5">
              <div>
                <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-black">
                  Sickle Cell Knowledge Quiz
                </h1>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">
                  Test your genetics understanding and review inheritance concepts with clear explanations.
                </p>
              </div>

              {/* Sub-tab Pill Switcher */}
              <div className="flex bg-surface-container rounded-full p-1.5 shadow-sm border border-surface-variant/40 shrink-0">
                <button
                  className={`px-5 py-2 rounded-full font-label-md text-xs sm:text-sm text-center transition-all cursor-pointer font-bold ${
                    quizSubTab === 'take'
                      ? 'bg-primary-container text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setQuizSubTab('take')}
                  type="button"
                >
                  Take Quiz
                </button>
                <button
                  className={`px-5 py-2 rounded-full font-label-md text-xs sm:text-sm text-center transition-all cursor-pointer font-bold ${
                    quizSubTab === 'history'
                      ? 'bg-primary-container text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setQuizSubTab('history')}
                  type="button"
                >
                  Score History
                </button>
              </div>
            </div>

            {quizSubTab === 'take' ? (
              <QuizCard
                openAuthModal={() => handleTabChange('auth')}
                onQuizCompleted={() => setQuizSubTab('history')}
              />
            ) : (
              <QuizHistory onTakeQuizClick={() => setQuizSubTab('take')} />
            )}
          </div>
        )}

        {/* Tab 5: Auth & Genotype Management (Supabase Users Schema) */}
        {activeTab === 'auth' && (
          <StitchAuthScreen
            onSuccess={() => {
              if (profile?.role === 'professional') {
                handleTabChange('provider-dashboard');
              } else {
                handleTabChange('dashboard');
              }
            }}
          />
        )}
      </main>

      {/* Global Telehealth & Registered Clinicians Directory Modal */}
      <StitchProfessionalsModal
        isOpen={isProfessionalsModalOpen}
        onClose={() => setIsProfessionalsModalOpen(false)}
      />

      {/* Modern Desktop Footer */}
      <footer className="w-full border-t border-surface-variant/50 bg-surface-container-low/50 py-8 mt-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2.5">
            <img
              src="/stitch-logo.png"
              alt="SCT Decision Tool Logo"
              className="h-6 w-auto object-contain"
            />
            <span className="font-bold text-on-surface">SCT Decision Tool</span>
            <span>— Clinical Clarity & Compassion</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <span>Ghana Data Protection Act (Act 843)</span>
            <span>Verified Clinical Guidance</span>
            <span>Private & Encrypted</span>
          </div>
        </div>
      </footer>

      {/* Signature Stitch Floating Bottom Navigation Dock */}
      <StitchBottomNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenProfessionals={() => setIsProfessionalsModalOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
