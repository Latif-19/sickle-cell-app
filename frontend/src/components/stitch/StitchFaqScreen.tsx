import React, { useState } from 'react';

interface FaqItem {
  id: string;
  category: 'trait-vs-disease' | 'testing' | 'athletics' | 'family-planning';
  question: string;
  answerSnippet: string;
  content: React.ReactNode;
}

interface StitchFaqScreenProps {
  onOpenProfessionals?: () => void;
  onNavigateToCalculator?: () => void;
  onNavigateToQuiz?: () => void;
}

export const StitchFaqScreen: React.FC<StitchFaqScreenProps> = ({
  onNavigateToCalculator,
  onNavigateToQuiz,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'trait-vs-disease' | 'testing' | 'athletics' | 'family-planning'>('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ 'q1': true, 'q2': true });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const faqs: FaqItem[] = [
    {
      id: 'q1',
      category: 'trait-vs-disease',
      question: 'What is the exact difference between Sickle Cell Trait (SCT) and Sickle Cell Disease (SCD)?',
      answerSnippet: 'Sickle cell inheritance depends on whether one or both inherited beta-globin genes carry the sickle mutation.',
      content: (
        <div className="pt-3 flex flex-col gap-4">
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Sickle cell inheritance depends on whether one or both inherited beta-globin genes carry the sickle mutation. Carrying the trait is <span className="font-bold text-on-surface">fundamentally different</span> from having the chronic medical disorder.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* SCT Carrier Card */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between gap-3 border-l-4 border-l-secondary border-y border-r border-surface-variant/70 shadow-[0_4px_16px_rgba(0,106,99,0.06)]">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-black flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  Carrier Status
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary text-on-secondary font-label-md text-xs font-black shadow-xs">
                  Hb AS
                </span>
              </div>
              <div>
                <h4 className="font-headline-sm text-base text-on-surface font-extrabold">Sickle Cell Trait (SCT)</h4>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mt-1">
                  One normal gene (A) and one altered gene (S). Red blood cells maintain normal round shape. Carriers lead typical lifespans without vaso-occlusive pain crises.
                </p>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5 rounded-xl font-label-md text-xs font-bold w-fit">
                <span className="material-symbols-outlined text-[17px]">check_circle</span>
                <span>Asymptomatic Carrier State</span>
              </div>
            </div>

            {/* SCD Disease Card */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between gap-3 border-l-4 border-l-on-surface border-y border-r border-surface-variant/70 shadow-[0_4px_16px_rgba(28,27,27,0.06)]">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface font-black flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-on-surface" />
                  Chronic Condition
                </span>
                <span className="px-3 py-1 rounded-full bg-inverse-surface text-surface font-label-md text-xs font-black shadow-xs">
                  Hb SS
                </span>
              </div>
              <div>
                <h4 className="font-headline-sm text-base text-on-surface font-extrabold">Sickle Cell Disease (SCD)</h4>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mt-1">
                  Two copies of the sickle gene (S). Cells distort into rigid sickles causing microvascular blockages, chronic hemolytic anemia, and pain requiring specialist care.
                </p>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 bg-surface-container-high text-on-surface border border-surface-variant/70 px-3 py-1.5 rounded-xl font-label-md text-xs font-bold w-fit">
                <span className="material-symbols-outlined text-[17px]">medical_services</span>
                <span>Requires Active Medical Management</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'q2',
      category: 'trait-vs-disease',
      question: 'Can a person with Sickle Cell Trait ever develop Sickle Cell Disease later in life?',
      answerSnippet: 'Your genetic makeup for hemoglobin is established at the exact moment of conception.',
      content: (
        <div className="pt-3 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-4 bg-secondary-container/30 border border-secondary/25 rounded-2xl">
            <span className="material-symbols-outlined text-secondary text-[24px]">verified</span>
            <p className="font-label-lg text-sm sm:text-base text-on-surface font-bold">
              Definitive Medical Answer: No, it is genetically impossible.
            </p>
          </div>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Your genetic makeup for hemoglobin is established at the exact moment of conception. Sickle Cell Trait does <span className="font-bold text-on-surface">not mutate, transition, or deteriorate</span> into Sickle Cell Disease as you age.
          </p>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Because trait carriers produce roughly 60% standard Hemoglobin A alongside roughly 40% Hemoglobin S, the healthy hemoglobin protects red cells from sickling under regular atmospheric conditions.
          </p>
        </div>
      )
    },
    {
      id: 'q3',
      category: 'testing',
      question: 'What laboratory tests accurately diagnose hemoglobin genotypes?',
      answerSnippet: 'Standard complete blood counts (CBC) do not evaluate hemoglobin variants.',
      content: (
        <div className="pt-3 flex flex-col gap-3">
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Standard Complete Blood Counts (CBC) do not evaluate hemoglobin variants. Accurate genotype determination requires quantitative fractionation:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="bg-surface-container-lowest p-4 rounded-2xl flex items-start gap-3 border border-surface-variant/60 shadow-xs hover:border-secondary transition-colors">
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">science</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-lg text-sm text-on-surface font-bold">Hemoglobin Electrophoresis</span>
                <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">Uses an electrical charge on gel matrices to separate hemoglobin bands (Hb A, Hb S, Hb C, Hb F).</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-2xl flex items-start gap-3 border border-surface-variant/60 shadow-xs hover:border-secondary transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-on-surface flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">analytics</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-lg text-sm text-on-surface font-bold">HPLC Chromatography</span>
                <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">The clinical gold standard automated methodology. Provides exact percentage quantification in minutes.</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-surface-container-lowest rounded-2xl border-l-4 border-l-primary-container border-y border-r border-surface-variant/60 shadow-xs">
            <span className="font-label-sm text-xs text-on-surface uppercase font-black tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">warning</span>
              Clinical Caution
            </span>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
              Rapid sickle turbidity tests ("Sickledex") are merely qualitative screens. They test positive for both trait and disease and cannot distinguish carrier status from disease.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'q4',
      category: 'athletics',
      question: 'Are there any health precautions or athletic hydration guidelines for trait carriers?',
      answerSnippet: 'Trait carriers participate safely across collegiate and professional athletics.',
      content: (
        <div className="pt-3 flex flex-col gap-3">
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Individuals with SCT participate safely across collegiate and professional athletics. However, under extreme physiological stressors—<span className="font-bold text-on-surface">severe dehydration, heat exhaustion, high altitude hypoxemia, and maximal all-out exertion without rest</span>—isolated red cells can sickle and trigger exertional rhabdomyolysis.
          </p>
          <div className="bg-surface-container-lowest p-4 rounded-2xl border-l-4 border-l-primary-container border-y border-r border-surface-variant/60 shadow-xs flex flex-col gap-1.5">
            <span className="font-label-md text-sm text-on-surface font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">water_drop</span>
              Carrier Hydration Protocol:
            </span>
            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Drink water consistently before, during, and after strenuous workouts. Take immediate rest and rehydrate if experiencing cramping, unusual exhaustion, or shortness of breath.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'q5',
      category: 'family-planning',
      question: 'What reproductive options exist if both partners carry the sickle cell trait (AS + AS)?',
      answerSnippet: 'Couples where both partners carry SCT have multiple empowering family planning options.',
      content: (
        <div className="pt-3 flex flex-col gap-3">
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Couples where both partners carry SCT have a 25% chance of sickle cell disease with each pregnancy. Modern medical reproductive technology offers empowering pathways:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            <li className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant/60 shadow-xs flex flex-col gap-1">
              <strong className="text-on-surface text-sm font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                IVF with PGT-M
              </strong>
              <span className="text-xs text-on-surface-variant leading-relaxed">Pre-implantation genetic diagnosis tests embryos before transfer to select only unaffected embryos.</span>
            </li>
            <li className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant/60 shadow-xs flex flex-col gap-1">
              <strong className="text-on-surface text-sm font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-container" />
                Prenatal Diagnostics
              </strong>
              <span className="text-xs text-on-surface-variant leading-relaxed">Early CVS (10-13 weeks) or Amniocentesis (15-20 weeks) to diagnose fetal genotype early in gestation.</span>
            </li>
            <li className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant/60 shadow-xs flex flex-col gap-1">
              <strong className="text-on-surface text-sm font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-outline" />
                Donor Gametes
              </strong>
              <span className="text-xs text-on-surface-variant leading-relaxed">Utilizing verified Hb AA donor eggs or sperm guarantees 0% chance of sickle cell disease.</span>
            </li>
          </ul>
        </div>
      )
    }
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedFilter === 'all' || faq.category === selectedFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answerSnippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col gap-8">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-variant/40 pb-5">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary-container text-on-secondary-container w-fit shadow-sm">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span className="font-label-sm text-xs tracking-wider uppercase font-extrabold">
              Evidence-Based Guidance
            </span>
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-4xl text-on-surface tracking-tight font-black">
            Frequently Asked Questions & Clinical Facts
          </h1>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-3xl">
            Accessible, physician-reviewed answers clarifying genetic carrier status, laboratory diagnostics, and everyday lifestyle safety.
          </p>
        </div>
      </div>

      {/* Full-width Search Bar & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <div className="flex items-center w-full h-14 bg-surface-container-lowest rounded-full px-5 shadow-[0_4px_20px_rgba(28,27,27,0.04)] border border-surface-variant/40">
            <span className="material-symbols-outlined text-outline mr-3 text-[22px]">search</span>
            <input
              className="w-full bg-transparent font-body-md text-sm sm:text-base text-on-surface placeholder:text-outline focus:outline-none"
              placeholder="Search topics (e.g. electrophoresis, hydration, IVF, Punnett)..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-outline hover:text-on-surface cursor-pointer p-1"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 shrink-0">
          {[
            { key: 'all', label: 'All Topics' },
            { key: 'trait-vs-disease', label: 'Traits vs Disease' },
            { key: 'testing', label: 'Testing' },
            { key: 'athletics', label: 'Athletics & Lifestyle' },
            { key: 'family-planning', label: 'Family Planning' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setSelectedFilter(f.key as any)}
              className={`shrink-0 px-4 py-2.5 rounded-full font-label-md text-xs sm:text-sm transition-all cursor-pointer font-bold ${
                selectedFilter === f.key
                  ? 'bg-inverse-surface text-surface shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Desktop 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: FAQ Accordion List (8 Columns on Desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {filteredFaqs.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-3xl p-10 text-center text-on-surface-variant border border-surface-variant/40">
              <span className="material-symbols-outlined text-[48px] text-outline mb-3">search_off</span>
              <p className="font-headline-sm font-bold text-lg">No matching topics found</p>
              <p className="font-body-sm text-sm mt-1">Try another search keyword or clear the search filter.</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = Boolean(openItems[faq.id]);
              return (
                <div
                  key={faq.id}
                  className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_32px_-4px_rgba(28,27,27,0.05),0_4px_12px_-2px_rgba(28,27,27,0.03)] overflow-hidden transition-all duration-300 border border-surface-variant/40"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-6 sm:p-7 flex items-start justify-between text-left gap-4 select-none cursor-pointer hover:bg-surface-container-low/50 transition-colors"
                    type="button"
                  >
                    <span className="font-headline-sm text-base sm:text-lg text-on-surface font-extrabold">
                      {faq.question}
                    </span>
                    <span
                      className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-300 ${
                        isOpen ? 'bg-primary-container text-on-surface rotate-180 shadow-sm' : 'bg-surface-container text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">expand_more</span>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 sm:px-7 pb-6 sm:pb-7 block border-t border-surface-variant/30">
                      {faq.content}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Clinical Companion Sidebar (4 Columns on Desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">
          {/* Knowledge & Assessment Highlight */}
          <div className="bg-secondary text-on-secondary rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 font-label-sm text-[11px] bg-secondary-fixed-dim/30 text-on-secondary px-3 py-1 rounded-full uppercase tracking-wider font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
                Knowledge & Assessment
              </span>
              <span className="font-label-sm text-xs text-secondary-container font-bold">Interactive</span>
            </div>

            <div>
              <h3 className="font-headline-sm text-lg text-on-secondary font-bold">
                Test Your Trait Understanding
              </h3>
              <p className="font-body-sm text-xs text-on-secondary/85 mt-1 leading-relaxed">
                Take our quick knowledge quiz or run inheritance scenarios in the calculator to evaluate carrier probabilities.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {onNavigateToCalculator && (
                <button
                  onClick={onNavigateToCalculator}
                  className="w-full h-11 bg-surface-container-lowest text-secondary hover:bg-surface-container-low rounded-full font-label-lg text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer shadow-md"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">calculate</span>
                  <span>Open Risk Calculator</span>
                </button>
              )}
              {onNavigateToQuiz && (
                <button
                  onClick={onNavigateToQuiz}
                  className="w-full h-11 bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 rounded-full font-label-lg text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">quiz</span>
                  <span>Take Knowledge Quiz</span>
                </button>
              )}
            </div>
          </div>

          {/* Diagnostic Cheat Sheet Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.06)] border border-surface-variant/40 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-surface-variant/30 pb-3">
              <span className="material-symbols-outlined text-secondary text-[22px]">medical_information</span>
              <h4 className="font-headline-sm text-base text-on-surface font-bold">
                Diagnostic Quick Reference
              </h4>
            </div>

            <div className="flex flex-col gap-3 font-body-sm text-xs">
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-variant/60 shadow-xs">
                <div className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-outline" />
                  CBC (Complete Blood Count)
                </div>
                <div className="text-on-surface-variant mt-1">Detects anemia, but CANNOT identify carrier status.</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-variant/60 shadow-xs">
                <div className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  Hemoglobin Electrophoresis
                </div>
                <div className="text-on-surface-variant mt-1">Identifies Hb S and Hb C bands with high clinical precision.</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-variant/60 shadow-xs">
                <div className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-container" />
                  HPLC Quantification
                </div>
                <div className="text-on-surface-variant mt-1">Calculates exact percentage ratios (e.g. 60% A, 40% S).</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
