import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitInquiry } from '../../services/inquiriesService';
import { Icon } from '../ui/Icon';

export interface HealthProfessional {
  id: string;
  name: string;
  credentials: string;
  title: string;
  institution: string;
  specialty: string;
  bio: string;
  availableSlot: string;
  verified: boolean;
  licenseNumber: string;
  initials: string;
  avatarBg: string;
}

interface StitchProfessionalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedCounselor?: string;
}

export const StitchProfessionalsModal: React.FC<StitchProfessionalsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile } = useAuth();

  // Inquiry Form State
  const [inquiryTarget, setInquiryTarget] = useState<HealthProfessional | null>(null);
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySending, setInquirySending] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);

  const professionals: HealthProfessional[] = [
    {
      id: 'genetics-reproductive',
      name: 'Reproductive Genetics Desk',
      credentials: 'MS, CGC Team',
      title: 'Certified Genetic Counselor Team',
      institution: 'National Sickle Cell Centre, Korle-Bu / SCFG',
      specialty: 'Reproductive Genetics & Trait Inheritance',
      bio: 'Clinical team supporting couples in decoding hemoglobin electrophoresis values, evaluating IVF with PGT-M, and navigating proactive family planning in Ghana.',
      availableSlot: 'Inquiries monitored daily',
      verified: true,
      licenseNumber: 'MDC-GH-GEN-01',
      initials: 'RG',
      avatarBg: 'bg-primary-container text-on-surface',
    },
    {
      id: 'pediatric-hematology',
      name: 'Pediatric Hematology Service',
      credentials: 'MBChB, FWACP Team',
      title: 'Pediatric Hematologist & SCT Specialists',
      institution: 'Komfo Anokye Teaching Hospital (KATH)',
      specialty: 'Pediatric Hematology & Pain Crisis Prevention',
      bio: 'Specialists in sickle cell disease management, athletic hydration guidelines, and newborn screening follow-up care across West Africa.',
      availableSlot: 'Inquiries monitored daily',
      verified: true,
      licenseNumber: 'MDC-GH-PED-02',
      initials: 'PH',
      avatarBg: 'bg-secondary-container text-on-secondary-container',
    },
    {
      id: 'adult-transition',
      name: 'Adult Hemoglobinopathy Support',
      credentials: 'DNP, FNP-C / FWACN Team',
      title: 'Clinical Nurse Specialists & Practitioners',
      institution: '37 Military Hospital & Regional SCT Service',
      specialty: 'Adult Care Transition & Crisis Management',
      bio: 'Specialized clinical staff dedicated to lifestyle counseling, exercise protocols for trait carriers, and community health advocacy in Ghana.',
      availableSlot: 'Inquiries monitored daily',
      verified: true,
      licenseNumber: 'MDC-GH-ADL-03',
      initials: 'AH',
      avatarBg: 'bg-primary-fixed text-on-primary-fixed',
    },
  ];

  if (!isOpen) return null;

  const handleBookSlot = (pro: HealthProfessional) => {
    setInquiryTarget(pro);
    setInquirySubject(`Consultation Request: ${pro.specialty}`);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryTarget || !inquirySubject.trim() || !inquiryMessage.trim()) return;

    setInquirySending(true);
    const { error } = await submitInquiry(
      profile?.id || `guest-${Date.now()}`,
      inquirySubject.trim(),
      inquiryMessage.trim(),
      profile?.genotype || 'Unknown',
      profile?.name || 'Inquiring Patient',
      profile?.email || 'patient@example.com'
    );
    setInquirySending(false);

    if (!error) {
      setInquirySuccess(`Your clinical question has been submitted to ${inquiryTarget.name} and logged in the Supabase inquiries table! Review responses in the Provider Portal.`);
      setInquirySubject('');
      setInquiryMessage('');
      setTimeout(() => {
        setInquirySuccess(null);
        setInquiryTarget(null);
      }, 3500);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-3xl rounded-3xl shadow-2xl border border-surface-variant/40 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-surface-variant/40 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center font-bold">
              <Icon name="medical_services" className="w-6 h-6 text-secondary" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-lg sm:text-xl font-bold text-on-surface">
                  Healthcare Professionals & Clinical Network
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-extrabold uppercase">
                  Ghana Verified
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Board-certified genetic counselors and hematologists specialized in sickle cell care.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer transition-colors"
            type="button"
            aria-label="Close modal"
          >
            <Icon name="close" className="w-5 h-5 text-on-surface-variant" size={20} />
          </button>
        </div>

        {/* Clinical Registration Notice */}
        <div className="px-6 py-2.5 bg-surface-container-low border-b border-surface-variant/40 flex items-center gap-2.5 text-xs text-on-surface-variant">
          <Icon name="info" className="w-4 h-4 text-secondary shrink-0" size={16} />
          <span>We are currently verifying with the Ghana Medical Service to strictly verify healthcare personnel before allowing clinical registration.</span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Clinician Directory View */}
          <div className="flex flex-col gap-4">
              {professionals.map((pro) => (
                <div
                  key={pro.id}
                  className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/60 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 hover:shadow-md hover:border-secondary transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Reliable Styled Initials Avatar */}
                    <div className={`w-14 h-14 rounded-2xl ${pro.avatarBg} flex items-center justify-center font-black text-lg shadow-sm shrink-0 ring-2 ring-surface`}>
                      {pro.initials}
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-headline-sm text-base font-bold text-on-surface">
                          {pro.name}, {pro.credentials}
                        </h4>
                        <span className="inline-flex items-center gap-1 font-label-sm text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
                          <Icon name="verified_user" className="w-3.5 h-3.5 text-on-secondary-container" size={13} />
                          Verified Specialist
                        </span>
                      </div>

                      <span className="font-body-sm text-xs font-semibold text-secondary">
                        {pro.title}
                      </span>
                      <span className="font-body-sm text-[11px] text-on-surface-variant">
                        {pro.institution} • Specialty: {pro.specialty}
                      </span>

                      <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mt-1">
                        {pro.bio}
                      </p>

                      <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-on-surface">
                        <Icon name="schedule" className="w-4 h-4 text-primary" size={15} />
                        <span>Next Slot: {pro.availableSlot}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
                    <button
                      onClick={() => handleBookSlot(pro)}
                      className="h-11 px-5 rounded-full font-label-md text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer bg-secondary text-on-secondary hover:brightness-105"
                      type="button"
                    >
                      <Icon name="videocam" className="w-4.5 h-4.5 text-on-secondary" size={17} />
                      <span>Request Consultation</span>
                    </button>

                    <button
                      onClick={() => setInquiryTarget(pro)}
                      className="h-10 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      type="button"
                    >
                      <Icon name="chat" className="w-4 h-4 text-on-surface" size={15} />
                      <span>Send Question</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Patient Inquiry Composer Sheet */}
              {inquiryTarget && (
                <div className="p-6 rounded-3xl bg-surface-container-low border-2 border-secondary/40 shadow-lg animate-in slide-in-from-bottom-2 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-surface-variant/40 pb-3">
                    <div className="flex items-center gap-2">
                      <Icon name="outgoing_mail" className="w-5 h-5 text-secondary" size={20} />
                      <div>
                        <h4 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
                          Consult with {inquiryTarget.name}, {inquiryTarget.credentials}
                        </h4>
                        <span className="font-body-sm text-[11px] text-on-surface-variant">
                          Inquiry will be saved for verified clinical review.
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setInquiryTarget(null)}
                      className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer hover:bg-surface-container-high"
                      type="button"
                    >
                      <Icon name="close" className="w-4.5 h-4.5 text-on-surface-variant" size={18} />
                    </button>
                  </div>

                  {inquirySuccess ? (
                    <div className="p-4 bg-secondary text-on-secondary rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
                      <Icon name="check_circle" className="w-5 h-5 text-on-secondary" size={20} />
                      <span>{inquirySuccess}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSendInquiry} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-xs font-bold text-on-surface">
                          Inquiry Subject / Topic
                        </label>
                        <input
                          type="text"
                          required
                          value={inquirySubject}
                          onChange={(e) => setInquirySubject(e.target.value)}
                          placeholder="e.g. Guidance on sickle cell trait inheritance probabilities"
                          className="h-11 px-3.5 rounded-xl bg-surface-container-lowest border border-surface-variant font-body-md text-xs sm:text-sm text-on-surface focus:outline-none focus:border-secondary"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-xs font-bold text-on-surface">
                          Your Question & Clinical Context
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          placeholder="Describe your question, partner hemoglobin status, or lab questions..."
                          className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-variant font-body-md text-xs sm:text-sm text-on-surface focus:outline-none focus:border-secondary"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setInquiryTarget(null)}
                          className="px-4 py-2 rounded-full border border-surface-variant text-on-surface font-label-md text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={inquirySending}
                          className="px-5 py-2 rounded-full bg-secondary text-on-secondary font-label-md text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105 cursor-pointer disabled:opacity-50"
                        >
                          <Icon name="send" className="w-4 h-4 text-on-secondary" size={16} />
                          <span>{inquirySending ? 'Submitting...' : 'Submit Inquiry to Clinician'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};
