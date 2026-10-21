import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../ui/Icon';
import type { ScreenTab } from './StitchBottomNav';

interface StitchHeaderProps {
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  onOpenProfessionals?: () => void;
}

export const StitchHeader: React.FC<StitchHeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-variant/50 shadow-[0_4px_24px_rgba(28,27,27,0.04)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 sm:gap-3.5 cursor-pointer group"
        >
          <img
            src="/stitch-logo.png"
            alt="Sickle Cell Trait Decision Tool Logo"
            className="h-10 sm:h-11 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform"
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

        {/* Right Section: Clinicians Trigger & User Profile / Sign In */}
        <div className="flex items-center gap-2 sm:gap-3">
          {profile?.role === 'professional' ? (
            <button
              onClick={() => setActiveTab('provider-dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                activeTab === 'provider-dashboard'
                  ? 'bg-secondary text-on-secondary ring-2 ring-secondary/30'
                  : 'bg-secondary-container text-secondary hover:bg-secondary-container/80 border border-secondary/25'
              }`}
              title="Open Health Professional Clinical Workspace"
              type="button"
            >
              <Icon name="clinical_notes" className="w-4 h-4" size={17} />
              <span className="hidden sm:inline">Provider Dashboard</span>
              <span className="sm:hidden">Workspace</span>
            </button>
          ) : null}

          {profile ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('auth')}
                className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                  activeTab === 'auth'
                    ? 'bg-surface-container-high border-outline'
                    : 'bg-surface-container-low hover:bg-surface-container border-surface-variant/60'
                }`}
                type="button"
                title="View your genotype and role profile"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[12px] shadow-sm shrink-0 ${
                  profile.role === 'professional'
                    ? 'bg-secondary-container text-secondary'
                    : 'bg-primary-container text-on-surface'
                }`}>
                  {profile.role === 'professional' ? (
                    <Icon name="stethoscope" className="w-4 h-4 text-secondary" size={17} />
                  ) : profile.genotype && profile.genotype !== 'Unknown' && profile.genotype !== 'Other' ? (
                    profile.genotype
                  ) : (
                    profile.name?.trim()?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="font-label-md text-[13px] font-bold text-on-surface leading-snug">
                      {profile.name}
                    </span>
                    {profile.role === 'professional' && (
                      <Icon name="verified" className="w-3.5 h-3.5 text-secondary" size={13} />
                    )}
                  </div>
                  <span className={`font-label-sm text-[10px] font-bold ${
                    profile.role === 'professional'
                      ? 'text-secondary'
                      : profile.genotype === 'Unknown'
                      ? 'text-amber-700'
                      : 'text-on-surface-variant'
                  }`}>
                    {profile.role === 'professional'
                      ? 'Clinician Role'
                      : profile.genotype === 'Unknown'
                      ? 'Genotype: Not Tested'
                      : `Hb ${profile.genotype} (Patient)`}
                  </span>
                </div>
              </button>

              <button
                onClick={() => signOut()}
                className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                title="Sign Out"
                type="button"
              >
                <Icon name="logout" className="w-5 h-5 text-on-surface-variant" size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('auth')}
              className="h-10 sm:h-11 px-4 sm:px-5 rounded-full bg-inverse-surface text-surface hover:bg-inverse-surface/90 font-label-md text-xs sm:text-[13px] flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer font-bold"
              type="button"
            >
              <Icon name="lock" className="w-4 h-4 text-surface" size={18} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
