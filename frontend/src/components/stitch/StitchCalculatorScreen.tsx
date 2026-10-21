import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Genotype } from '../../types/database';

export const StitchCalculatorScreen: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [userGenotype, setUserGenotype] = useState<Genotype>(profile?.genotype || 'AS');
  const [partnerGenotype, setPartnerGenotype] = useState<Genotype>('AS');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Extract alleles
  const getAlleles = (gt: Genotype): [string, string] => {
    switch (gt) {
      case 'AA': return ['A', 'A'];
      case 'AS': return ['A', 'S'];
      case 'SS': return ['S', 'S'];
      case 'AC': return ['A', 'C'];
      case 'SC': return ['S', 'C'];
      default: return ['A', 'S'];
    }
  };

  const p1Alleles = getAlleles(userGenotype);
  const p2Alleles = getAlleles(partnerGenotype);

  const combineAlleles = (a1: string, a2: string): string => {
    const pair = [a1, a2].sort().join('');
    if (pair === 'AA') return 'AA';
    if (pair === 'AS') return 'AS';
    if (pair === 'SS') return 'SS';
    if (pair === 'AC') return 'AC';
    if (pair === 'CS') return 'SC';
    if (pair === 'CC') return 'CC';
    return pair;
  };

  // 4 Punnett boxes
  const box1 = combineAlleles(p1Alleles[0], p2Alleles[0]);
  const box2 = combineAlleles(p1Alleles[0], p2Alleles[1]);
  const box3 = combineAlleles(p1Alleles[1], p2Alleles[0]);
  const box4 = combineAlleles(p1Alleles[1], p2Alleles[1]);

  const outcomes = [box1, box2, box3, box4];

  // Count distribution
  const counts: Record<string, number> = {};
  outcomes.forEach((gt) => {
    counts[gt] = (counts[gt] || 0) + 1;
  });

  const getGenotypeMeta = (gt: string) => {
    switch (gt) {
      case 'AA':
        return {
          title: 'Hb AA — Unaffected',
          tag: 'Zero Disease Risk',
          category: 'Normal Adult Hemoglobin',
          desc: 'Child receives standard hemoglobin from both parents. Not a carrier, will not transmit sickle gene.',
          color: 'text-secondary font-black',
          barColor: 'bg-secondary',
          tagBg: 'bg-secondary text-on-secondary font-black shadow-xs',
        };
      case 'AS':
        return {
          title: 'Hb AS — Sickle Cell Trait',
          tag: 'Healthy Trait Carrier',
          category: 'Asymptomatic Carrier',
          desc: 'Normal red blood cell lifespan under standard atmospheric conditions. Can pass sickle gene to children.',
          color: 'text-on-surface font-black',
          barColor: 'bg-primary-container',
          tagBg: 'bg-primary-container text-on-surface font-black shadow-xs',
        };
      case 'SS':
        return {
          title: 'Hb SS — Sickle Cell Disease',
          tag: 'Clinical Care Required',
          category: 'Sickle Cell Anemia',
          desc: 'Child inherits sickle mutation from both parents, presenting with hemoglobin S polymerizing disease requiring comprehensive care.',
          color: 'text-error font-black',
          barColor: 'bg-error',
          tagBg: 'bg-inverse-surface text-surface font-black shadow-xs',
        };
      case 'AC':
        return {
          title: 'Hb AC — Hemoglobin C Trait',
          tag: 'C Trait Carrier',
          category: 'Asymptomatic',
          desc: 'Asymptomatic hemoglobin C carrier. Can pass C gene to offspring.',
          color: 'text-secondary font-black',
          barColor: 'bg-secondary',
          tagBg: 'bg-secondary text-on-secondary font-black shadow-xs',
        };
      case 'SC':
        return {
          title: 'Hb SC — Disease Variant',
          tag: 'Clinical Care Required',
          category: 'Hemoglobin SC Disorder',
          desc: 'Variant form of sickle cell disease resulting from inheriting one S and one C allele.',
          color: 'text-error font-black',
          barColor: 'bg-error',
          tagBg: 'bg-inverse-surface text-surface font-black shadow-xs',
        };
      default:
        return {
          title: `Hb ${gt}`,
          tag: 'Genetic Variant',
          category: 'Variant',
          desc: 'Hemoglobin variation requiring clinical electrophoresis review.',
          color: 'text-on-surface',
          barColor: 'bg-surface-variant',
          tagBg: 'bg-surface-container text-on-surface font-bold',
        };
    }
  };

  const handleSaveToProfile = async () => {
    if (profile) {
      await updateProfile({ genotype: userGenotype });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const hasDiseaseRisk = outcomes.some((o) => o === 'SS' || o === 'SC');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-variant/40 pb-5">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary-container text-on-secondary-container w-fit shadow-sm">
            <span className="material-symbols-outlined text-[16px]">biotech</span>
            <span className="font-label-sm text-xs tracking-wider uppercase font-extrabold">
              Mendelian Autosomal Model
            </span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-4xl text-on-surface tracking-tight font-black">
            Interactive Inheritance Calculator
          </h1>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-3xl">
            Select parental hemoglobin electrophoresis values to simulate Punnett-square gamete fusion and calculate real-time reproductive distribution.
          </p>
        </div>

        <div className="shrink-0">
          <span className="font-label-sm text-xs bg-surface-container-high text-on-surface px-4 py-2 rounded-full font-bold">
            Standard 1-in-4 Independent Basis
          </span>
        </div>
      </div>

      {/* Responsive Desktop Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Genotype Cross Inputs (5 Columns on Desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
          <div className="bg-inverse-surface text-inverse-on-surface rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-5 relative z-10">
              <div className="flex items-center justify-between border-b border-surface-container-highest/20 pb-3">
                <span className="font-headline-sm text-base font-bold text-surface">
                  Parental Genetic Pairing
                </span>
                <span className="material-symbols-outlined text-primary-container text-[20px]">
                  dna
                </span>
              </div>

              {/* User Genotype Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-sm text-inverse-on-surface flex items-center gap-1.5 font-bold">
                    <span>Parent 1 (Your Genotype)</span>
                    <span className="material-symbols-outlined text-outline-variant text-[16px]">person</span>
                  </label>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-surface font-label-sm text-xs font-black">
                    {userGenotype}
                  </span>
                </div>
                <div className="relative">
                  <select
                    className="w-full h-14 bg-surface-container-highest/20 text-inverse-on-surface font-body-md text-sm sm:text-base rounded-2xl px-4 pr-12 appearance-none focus:outline-none focus:bg-surface-container-highest/30 shadow-inner border border-surface-container-highest/20"
                    value={userGenotype}
                    onChange={(e) => setUserGenotype(e.target.value as Genotype)}
                  >
                    <option className="bg-inverse-surface text-inverse-on-surface" value="AA">
                      Hb AA — Normal Hemoglobin
                    </option>
                    <option className="bg-inverse-surface text-inverse-on-surface" value="AS">
                      Hb AS — Sickle Cell Trait Carrier
                    </option>
                    <option className="bg-inverse-surface text-inverse-on-surface" value="SS">
                      Hb SS — Sickle Cell Disease
                    </option>
                    <option className="bg-inverse-surface text-inverse-on-surface" value="AC">
                      Hb AC — Hemoglobin C Trait
                    </option>
                    <option className="bg-inverse-surface text-inverse-on-surface" value="SC">
                      Hb SC — Hemoglobin SC Disease
                    </option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none text-[22px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Genetic Cross Separator */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="w-full h-px bg-surface-container-highest/20 absolute" />
                <div
                  className="relative z-10 w-11 h-11 rounded-full bg-primary-container text-on-surface flex items-center justify-center shadow-lg transform active:scale-95 transition-transform"
                  title="Cross product"
                >
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    close
                  </span>
                </div>
              </div>

              {/* Partner Genotype Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-sm text-inverse-on-surface flex items-center gap-1.5 font-bold">
                    <span>Parent 2 (Partner Genotype)</span>
                    <span className="material-symbols-outlined text-outline-variant text-[16px]">partner_exchange</span>
                  </label>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-black">
                    {partnerGenotype}
                  </span>
                </div>
                <div className="relative">
                  <select
                    className="w-full h-14 bg-surface-container-highest/20 text-inverse-on-surface font-body-md text-sm sm:text-base rounded-2xl px-4 pr-12 appearance-none focus:outline-none focus:bg-surface-container-highest/30 shadow-inner border border-surface-container-highest/20"
                    value={partnerGenotype}
                    onChange={(e) => setPartnerGenotype(e.target.value as Genotype)}
                  >
                    <option className="bg-inverse-surface text-inverse-on-surface" value="AA">
                      Hb AA — Normal Hemoglobin
                    </option>
                    <option className="bg-inverse-surface text-inverse-on-surface" value="AS">
                      Hb AS — Sickle Cell Trait Carrier
                    </option>
                    <option className="bg-inverse-surface text-inverse-on-surface" value="SS">
                      Hb SS — Sickle Cell Disease
                    </option>
                    <option className="bg-inverse-surface text-inverse-on-surface" value="AC">
                      Hb AC — Hemoglobin C Trait
                    </option>
                    <option className="bg-inverse-surface text-inverse-on-surface" value="SC">
                      Hb SC — Hemoglobin SC Disease
                    </option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none text-[22px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Action: Save to My Profile */}
              <button
                onClick={handleSaveToProfile}
                className="mt-2 w-full h-13 rounded-full bg-primary-container text-on-surface font-headline-sm text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20 active:scale-[0.98] transition-all cursor-pointer font-extrabold hover:brightness-105"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {saveSuccess ? 'check_circle' : 'save'}
                </span>
                <span>
                  {saveSuccess ? 'Saved to Your Profile!' : 'Save Genotype to My Profile'}
                </span>
              </button>

              <div className="flex items-center gap-2 pt-2 text-surface/70 font-body-sm text-xs">
                <span className="material-symbols-outlined text-[16px] text-primary-container">shield</span>
                <span>Your values are securely saved with medical data privacy.</span>
              </div>
            </div>
          </div>

          {/* Clinical Alert Callout */}
          <div className={`p-5 rounded-3xl border flex items-start gap-3.5 shadow-sm ${
            hasDiseaseRisk
              ? 'bg-error-container/30 border-error/30 text-on-surface'
              : 'bg-secondary-container/30 border-secondary/30 text-on-surface'
          }`}>
            <span className={`material-symbols-outlined text-[24px] shrink-0 ${
              hasDiseaseRisk ? 'text-error' : 'text-secondary'
            }`}>
              {hasDiseaseRisk ? 'warning' : 'verified'}
            </span>
            <div className="flex flex-col text-xs leading-relaxed">
              <span className="font-bold text-sm mb-0.5">
                {hasDiseaseRisk ? 'Genetic Counselor Review Recommended' : 'Low Disease Risk Pair'}
              </span>
              <p className="text-on-surface-variant">
                {hasDiseaseRisk
                  ? 'This parental combination carries a risk of producing a child with a sickle cell hemoglobinopathy. In vitro fertilization with PGT-M or early prenatal counseling can provide clarity.'
                  : 'Neither parent transmits double sickle mutations. All offspring are protected from sickle cell disease.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Calculation Results & Punnett Matrix (7 Columns on Desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Probability Cards Section */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.06)] border border-surface-variant/40 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">analytics</span>
                <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                  Statistical Pregnancy Outcomes
                </h3>
              </div>
              <span className="font-label-sm text-xs text-on-surface-variant font-semibold">
                Per-Pregnancy Risk
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(counts).map(([gt, count]) => {
                const meta = getGenotypeMeta(gt);
                const percentage = (count / 4) * 100;

                return (
                  <div
                    key={gt}
                    className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-3 relative overflow-hidden border border-surface-variant/60 hover:shadow-md transition-shadow"
                  >
                    <div className={`w-2.5 ${meta.barColor} absolute left-0 top-0 bottom-0 rounded-l`} />
                    <div className="flex flex-col gap-1.5 pl-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full ${meta.tagBg} font-label-sm text-[11px] font-extrabold`}>
                          {meta.tag}
                        </span>
                        <span className={`font-data-display text-2xl sm:text-3xl ${meta.color} leading-none font-black`}>
                          {percentage}%
                        </span>
                      </div>
                      <h4 className="font-headline-sm text-base text-on-surface font-bold pt-1">{meta.title}</h4>
                      <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">{meta.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Punnett Square Matrix Grid */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.06)] border border-surface-variant/40 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-3">
              <div className="flex flex-col">
                <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-extrabold">
                  Mendelian Allele Matrix
                </span>
                <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                  2×2 Punnett Inheritance Model
                </h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="w-full max-w-md mx-auto">
              <div className="grid grid-cols-3 gap-3 text-center items-center">
                {/* Header corner */}
                <div className="p-3 text-on-surface font-label-sm text-xs font-bold bg-surface-container-lowest border border-surface-variant/60 rounded-2xl">
                  P1 \ P2
                </div>
                {/* Partner Alleles Top Row */}
                <div className="p-3 rounded-2xl bg-surface-container font-headline-md font-black text-on-surface text-lg">
                  {p2Alleles[0]}
                </div>
                <div className="p-3 rounded-2xl bg-surface-container font-headline-md font-black text-on-surface text-lg">
                  {p2Alleles[1]}
                </div>

                {/* Row 1 */}
                <div className="p-3 rounded-2xl bg-surface-container font-headline-md font-black text-on-surface text-lg">
                  {p1Alleles[0]}
                </div>
                <div className="p-4 rounded-2xl bg-secondary-container/40 flex flex-col items-center justify-center border border-secondary/20 shadow-sm">
                  <span className="font-headline-md text-xl text-on-surface font-black">{box1}</span>
                  <span className="font-label-sm text-[11px] text-secondary font-bold">
                    {box1 === 'AA' ? 'Unaffected' : box1 === 'SS' ? 'Disease' : 'Carrier'}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-primary-fixed/40 flex flex-col items-center justify-center border border-primary-container/40 shadow-sm">
                  <span className="font-headline-md text-xl text-on-surface font-black">{box2}</span>
                  <span className="font-label-sm text-[11px] text-primary font-bold">
                    {box2 === 'AA' ? 'Unaffected' : box2 === 'SS' ? 'Disease' : 'Carrier'}
                  </span>
                </div>

                {/* Row 2 */}
                <div className="p-3 rounded-2xl bg-surface-container font-headline-md font-black text-on-surface text-lg">
                  {p1Alleles[1]}
                </div>
                <div className="p-4 rounded-2xl bg-primary-fixed/40 flex flex-col items-center justify-center border border-primary-container/40 shadow-sm">
                  <span className="font-headline-md text-xl text-on-surface font-black">{box3}</span>
                  <span className="font-label-sm text-[11px] text-primary font-bold">
                    {box3 === 'AA' ? 'Unaffected' : box3 === 'SS' ? 'Disease' : 'Carrier'}
                  </span>
                </div>
                <div className={`p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center ${
                  box4 === 'SS' || box4 === 'SC'
                    ? 'bg-inverse-surface text-surface border border-inverse-surface'
                    : 'bg-secondary-container/40 border border-secondary/20'
                }`}>
                  <span className={`font-headline-md text-xl font-black ${
                    box4 === 'SS' || box4 === 'SC' ? 'text-surface' : 'text-on-surface'
                  }`}>{box4}</span>
                  <span className={`font-label-sm text-[11px] font-bold ${
                    box4 === 'SS' || box4 === 'SC' ? 'text-primary-container' : 'text-secondary'
                  }`}>
                    {box4 === 'SS' || box4 === 'SC' ? 'Disease' : box4 === 'AA' ? 'Unaffected' : 'Carrier'}
                  </span>
                </div>
              </div>
            </div>

            <p className="font-body-sm text-xs text-on-surface-variant text-center pt-2">
              Each quad represents an independent 25% Mendelian probability with every individual pregnancy event.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
