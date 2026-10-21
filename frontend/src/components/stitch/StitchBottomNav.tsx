import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../ui/Icon';

export type ScreenTab = 'dashboard' | 'calculator' | 'education' | 'quiz' | 'auth' | 'provider-dashboard';

interface StitchBottomNavProps {
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  onOpenProfessionals?: () => void;
}

export const StitchBottomNav: React.FC<StitchBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfessionals,
}) => {
  const { profile } = useAuth();
  const isProfessional = profile?.role === 'professional';

  const navItems: { tab: ScreenTab; label: string; icon: string; shortLabel: string }[] = isProfessional
    ? [
        { tab: 'provider-dashboard', label: 'Clinical Workspace', shortLabel: 'Workspace', icon: 'clinical_notes' },
        { tab: 'dashboard', label: 'Patient Dashboard', shortLabel: 'Overview', icon: 'dashboard' },
        { tab: 'calculator', label: 'Genotype Calculator', shortLabel: 'Calculator', icon: 'calculate' },
        { tab: 'education', label: 'FAQs & Library', shortLabel: 'Learn', icon: 'menu_book' },
      ]
    : [
        { tab: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: 'dashboard' },
        { tab: 'calculator', label: 'Genotype Calculator', shortLabel: 'Calculator', icon: 'calculate' },
        { tab: 'education', label: 'Education & FAQs', shortLabel: 'Learn', icon: 'menu_book' },
        { tab: 'quiz', label: 'Knowledge Quiz', shortLabel: 'Quiz', icon: 'quiz' },
      ];

  return (
    <nav className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-3 pb-safe">
      <div className="flex items-center gap-1 sm:gap-2 bg-surface-container-lowest/95 backdrop-blur-2xl p-1.5 sm:p-2 rounded-full shadow-[0_16px_40px_-6px_rgba(28,27,27,0.18),0_4px_16px_-2px_rgba(28,27,27,0.08)] border border-surface-variant/60 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-full font-label-md text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer font-bold ${
                isActive
                  ? 'bg-primary-container text-on-surface shadow-[0_4px_16px_rgba(255,204,0,0.4)] scale-[1.02]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
              type="button"
            >
              <Icon name={item.icon} className="w-5 h-5" size={20} />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden text-[11px]">{item.shortLabel}</span>
            </button>
          );
        })}

        {onOpenProfessionals && (
          <button
            onClick={onOpenProfessionals}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-label-md text-xs sm:text-sm flex items-center gap-1.5 text-secondary hover:bg-secondary-container/40 transition-all cursor-pointer font-bold border border-secondary/25"
            type="button"
            title="Clinicians & Counselors Directory"
          >
            <Icon name="medical_services" className="w-5 h-5 text-secondary" size={20} />
            <span className="hidden sm:inline">Clinicians</span>
          </button>
        )}
      </div>
    </nav>
  );
};
