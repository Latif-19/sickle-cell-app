import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface StitchDashboardScreenProps {
  onNavigateToCalculator: () => void;
  onNavigateToLearn: () => void;
  onNavigateToQuiz: () => void;
  onOpenProfessionals?: () => void;
}

export const StitchDashboardScreen: React.FC<StitchDashboardScreenProps> = ({
  onNavigateToCalculator,
  onNavigateToLearn,
  onNavigateToQuiz,
}) => {
  const { profile } = useAuth();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col gap-8 sm:gap-10">
      {/* Expansive Desktop Radiant Hero Section */}
      <section className="w-full bg-primary-container text-on-surface p-6 sm:p-10 lg:p-12 rounded-3xl shadow-[0_20px_50px_-16px_rgba(255,204,0,0.5)] relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-surface-container-lowest/20 rounded-full pointer-events-none blur-3xl" />
        <div className="absolute right-1/4 -bottom-20 w-64 h-64 bg-primary/10 rounded-full pointer-events-none blur-2xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl text-on-surface font-black tracking-tight leading-tight">
              {profile ? `Welcome back, ${profile.name}.` : 'Sickle Cell Trait Decision Support.'}<br />
              <span className="text-on-primary-container">Your trait knowledge starts here.</span>
            </h1>

            <p className="font-body-lg text-base sm:text-lg text-on-surface/85 leading-relaxed max-w-2xl">
              Understand inheritance risks, explore carrier status, and prepare for confident, proactive family planning with clear guidance.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onNavigateToCalculator}
                className="h-14 px-7 bg-inverse-surface text-surface rounded-full font-headline-sm text-[15px] flex items-center justify-center gap-2.5 shadow-[0_8px_24px_rgba(28,27,27,0.25)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer font-bold"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  calculate
                </span>
                <span>Launch Inheritance Calculator</span>
              </button>

              <button
                onClick={onNavigateToQuiz}
                className="h-14 px-7 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low rounded-full font-headline-sm text-[15px] flex items-center justify-center gap-2.5 shadow-[0_4px_18px_rgba(28,27,27,0.08)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer font-bold"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px] text-secondary">
                  quiz
                </span>
                <span>Take Knowledge Assessment</span>
              </button>
            </div>
          </div>

          {/* Hero Right: Statistical & Trust Mosaic */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest/85 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-surface-container-lowest flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Carrier Prevalence
                </span>
                <span className="w-9 h-9 rounded-full bg-primary-container/40 flex items-center justify-center text-on-primary-container">
                  <span className="material-symbols-outlined text-[20px]">genetics</span>
                </span>
              </div>
              <div className="mt-4">
                <p className="font-headline-xl text-3xl sm:text-4xl text-on-surface font-black">1 in 3</p>
                <p className="font-body-sm text-[13px] text-on-surface-variant mt-1">People in Ghana carry a hemoglobin trait (Hb AS or AC).</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest/85 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-surface-container-lowest flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Private & Free
                </span>
                <span className="w-9 h-9 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                </span>
              </div>
              <div className="mt-4">
                <p className="font-headline-xl text-3xl sm:text-4xl text-on-surface font-black">100% Free</p>
                <p className="font-body-sm text-[13px] text-on-surface-variant mt-1">Confidential inheritance calculations and educational guidance.</p>
              </div>
            </div>

            <div className="sm:col-span-2 bg-inverse-surface text-surface p-5 rounded-3xl shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-surface flex items-center justify-center font-extrabold text-[16px] shrink-0">
                {profile?.genotype && profile.genotype !== 'Unknown' && profile.genotype !== 'Other'
                  ? profile.genotype
                  : profile ? '?' : '—'}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-[15px] font-bold text-surface">
                    {profile
                      ? (profile.genotype === 'Unknown'
                          ? 'Profile: Genotype Not Tested'
                          : `Saved Genotype: Hb ${profile.genotype}`)
                      : 'Guest Session — Sign In to Save Profile'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    profile ? 'bg-primary-container text-on-surface' : 'bg-surface-variant text-on-surface-variant'
                  }`}>
                    {profile ? 'Active' : 'Guest'}
                  </span>
                </div>
                <p className="font-body-sm text-[12px] text-surface/75 truncate mt-0.5">
                  {profile
                    ? 'Your hemoglobin genotype is securely saved to your account.'
                    : 'Create an account to save your hemoglobin genotype and test results.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Plan Section Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-surface-variant/40 pb-4">
        <div>
          <span className="font-label-sm text-[12px] uppercase tracking-wider text-secondary font-extrabold">
            Educational Tools
          </span>
          <h2 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-black tracking-tight">
            Explore Trait Resources
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-label-md text-[13px] bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full font-bold shadow-sm">
            Phase 1 • Assessment & Screening
          </span>
        </div>
      </div>

      {/* Responsive Multi-Column Grid (3 Columns on Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {/* Card 1: Step 1 (Calculate Inheritance Probability) */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.06),0_4px_12px_-2px_rgba(28,27,27,0.03)] flex flex-col justify-between gap-5 border border-surface-variant/40 hover:shadow-lg transition-shadow">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 font-label-sm text-[11px] bg-primary-container text-on-surface px-3 py-1 rounded-full font-extrabold">
                <span className="material-symbols-outlined text-[14px]">star</span>
                Recommended Step 1
              </span>
              <div className="w-11 h-11 rounded-2xl bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed shadow-sm">
                <span className="material-symbols-outlined text-[22px]">bubble_chart</span>
              </div>
            </div>

            <div>
              <h3 className="font-headline-md text-xl text-on-surface font-bold">
                Calculate Inheritance Probability
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant mt-2 leading-relaxed">
                Input parental hemoglobin lab values (Hb AA, AS, AC, or SS) to view exact Punnett-square probabilities for future offspring.
              </p>
            </div>

            {/* Probability preview track */}
            <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-on-surface">
                <span className="font-label-md text-xs font-bold">Inheritance Probability Ratios</span>
                <span className="font-label-sm text-xs text-secondary font-extrabold">2 Min Check</span>
              </div>
              <div className="w-full bg-surface-variant h-3 rounded-full overflow-hidden flex">
                <div className="bg-primary-container h-full w-1/4" title="25% AA Unaffected" />
                <div className="bg-secondary h-full w-2/4" title="50% AS Trait Carrier" />
                <div className="bg-error h-full w-1/4" title="25% SS Disease Risk" />
              </div>
              <div className="flex justify-between font-label-sm text-[11px] text-on-surface-variant pt-0.5">
                <span>25% AA</span>
                <span>50% AS Trait</span>
                <span>25% SS</span>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToCalculator}
            className="w-full h-13 bg-primary-container text-on-surface hover:brightness-105 rounded-full font-label-lg text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer shadow-[0_4px_14px_rgba(255,204,0,0.35)] font-bold"
            type="button"
          >
            <span>Open Risk Calculator</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        {/* Card 2: Deep Teal Accent Quiz / Knowledge Card */}
        <div className="bg-secondary text-on-secondary rounded-3xl p-6 sm:p-7 shadow-[0_16px_36px_-6px_rgba(0,106,99,0.3)] flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-secondary-container/20 rounded-full pointer-events-none blur-2xl" />

          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-label-sm text-[11px] bg-secondary-fixed-dim/30 text-on-secondary px-3 py-1 rounded-full uppercase tracking-wider font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
                Step 2 • Test Knowledge
              </span>
              <span className="font-label-sm text-xs text-secondary-container font-semibold">
                Interactive Quiz
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-md text-xl font-black shadow-md ring-2 ring-secondary-container/80">
                  <span className="material-symbols-outlined text-[28px]">quiz</span>
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="font-headline-sm text-base text-on-secondary font-bold">
                  Sickle Cell Knowledge Quiz
                </h4>
                <p className="font-body-sm text-xs text-on-secondary/80">Interactive assessment for carrier facts and inheritance.</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="material-symbols-outlined text-[16px] text-primary-container">timer</span>
                  <span className="font-label-sm text-[11px] text-on-secondary/90 font-medium">5-minute quick test</span>
                </div>
              </div>
            </div>

            <div className="bg-on-secondary-fixed-variant/40 rounded-2xl p-4 text-on-secondary">
              <p className="font-body-sm text-xs text-on-secondary/90 leading-relaxed italic">
                “Understanding trait carrier status vs. disease empowers you and your family to make informed reproductive choices.”
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToQuiz}
            className="w-full h-13 bg-surface-container-lowest text-secondary hover:bg-surface-container-low rounded-full font-label-lg text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer shadow-md font-bold relative z-10"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">play_circle</span>
            <span>Start Knowledge Quiz</span>
          </button>
        </div>

        {/* Card 3: Partner Screening Guide */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-7 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.06),0_4px_12px_-2px_rgba(28,27,27,0.03)] flex flex-col justify-between gap-5 border border-surface-variant/40 hover:shadow-lg transition-shadow">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 font-label-sm text-[11px] bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-extrabold uppercase">
                Step 3 • Diagnostics
              </span>
              <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
                <span className="material-symbols-outlined text-[22px]">group_add</span>
              </div>
            </div>

            <div>
              <h3 className="font-headline-md text-xl text-on-surface font-bold">
                Understand Partner Screening
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant mt-2 leading-relaxed">
                A routine blood count is insufficient. Quantitative hemoglobin electrophoresis is standard to accurately verify carrier traits.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-variant/60 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-xs text-on-surface font-bold">
                    Hemoglobin Electrophoresis
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant truncate">
                    Distinguishes Hb A from S, C, Beta Thal
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-variant/60 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">biotech</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-xs text-on-surface font-bold">
                    Accredited Laboratory Testing
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant truncate">
                    Available at certified medical laboratories across Ghana
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToLearn}
            className="w-full h-13 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-full font-label-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer font-bold"
            type="button"
          >
            <span>Read Partner Testing Guide</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Secondary Desktop Row: Saved Database Record + Clinical Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* Left: Saved Database Records (7 Columns) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.06)] border border-surface-variant/40 flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between border-b border-surface-variant/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-secondary-container/50 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">folder_shared</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                  Your Saved Genotype Record
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Securely stored with medical privacy and encryption.
                </p>
              </div>
            </div>
            <span className="font-label-sm text-xs text-secondary bg-secondary-container/50 px-3 py-1 rounded-full font-bold uppercase">
              Private & Encrypted
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-variant/60 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-surface font-headline-sm flex items-center justify-center font-black text-base shadow-sm shrink-0">
                {profile?.genotype && profile.genotype !== 'Unknown' && profile.genotype !== 'Other'
                  ? profile.genotype
                  : profile ? '?' : '—'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-sm text-on-surface font-bold truncate">
                  {profile?.name || 'Current User'} (You)
                </span>
                <span className="font-body-sm text-xs text-on-surface-variant">
                  {profile?.genotype === 'Unknown' ? 'Genotype Not Tested' : `Hemoglobin ${profile?.genotype || 'AS'} • Verified`}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-variant/60 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-on-surface-variant font-headline-sm flex items-center justify-center font-black text-base shrink-0">
                —
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-sm text-on-surface font-bold truncate">
                  Partner Genotype
                </span>
                <span className="font-body-sm text-xs text-on-surface-variant">
                  Not Yet Added • Test in Calculator
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="font-body-sm text-xs text-on-surface-variant">
              Want to check different combinations?
            </span>
            <button
              onClick={onNavigateToCalculator}
              className="font-label-md text-xs text-secondary hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Test Combinations in Calculator</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Right: Clinical Fact Card (5 Columns) */}
        <div className="lg:col-span-5 bg-inverse-surface text-surface rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-md border border-inverse-surface">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-surface shrink-0 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[32px]">microbiology</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-primary-container font-black">
                Core Medical Fact
              </span>
              <h4 className="font-headline-sm text-lg text-surface font-black mt-0.5">
                Sickle Cell Trait is NOT Sickle Cell Disease.
              </h4>
            </div>
          </div>

          <p className="font-body-md text-sm text-surface/85 leading-relaxed">
            People with sickle cell trait carry one normal hemoglobin gene and one sickle gene. Their red blood cells maintain normal flexibility and standard lifespans under daily conditions.
          </p>

          <div className="pt-2 border-t border-surface/20 flex items-center justify-between">
            <span className="font-label-sm text-xs text-surface/70 font-semibold">
              Ghana Health Service & WHO Guidance
            </span>
            <button
              onClick={onNavigateToLearn}
              className="font-label-sm text-xs text-primary-container hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Explore FAQs</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
