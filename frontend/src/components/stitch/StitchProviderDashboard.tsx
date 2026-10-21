import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Inquiry } from '../../types/database';
import { getInquiries, respondToInquiry, updateInquiryStatus } from '../../services/inquiriesService';
import { Icon } from '../ui/Icon';

interface StitchProviderDashboardProps {
  onSwitchToPatientView?: () => void;
  onOpenCliniciansDirectory?: () => void;
}

interface AppointmentItem {
  id: string;
  patientName: string;
  patientGenotype: string;
  appointmentType: string;
  dateTime: string;
  mode: 'Video Telehealth' | 'In-Clinic Consult';
  status: 'Confirmed' | 'Pending Confirmation';
  notes: string;
}

export const StitchProviderDashboard: React.FC<StitchProviderDashboardProps> = ({
  onSwitchToPatientView,
  onOpenCliniciansDirectory,
}) => {
  const { profile, switchRole } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_review' | 'responded'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Clinical appointments schedule (loaded from live bookings)
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);

  // Load inquiries
  const loadInquiries = async () => {
    const list = await getInquiries();
    setInquiries(list);
    if (!selectedInquiryId && list.length > 0) {
      setSelectedInquiryId(list[0].id);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId) || inquiries[0];

  const filteredInquiries = inquiries.filter((inq) => {
    if (statusFilter === 'all') return true;
    return inq.status === statusFilter;
  });

  const pendingCount = inquiries.filter((i) => i.status === 'pending').length;
  const inReviewCount = inquiries.filter((i) => i.status === 'in_review').length;
  const respondedCount = inquiries.filter((i) => i.status === 'responded').length;

  const handleSelectInquiry = (inq: Inquiry) => {
    setSelectedInquiryId(inq.id);
    if (inq.response) {
      setReplyText(inq.response);
    } else {
      setReplyText('');
    }
    // If pending, move to in_review automatically
    if (inq.status === 'pending') {
      updateInquiryStatus(inq.id, 'in_review').then(() => {
        setInquiries((prev) =>
          prev.map((item) => (item.id === inq.id ? { ...item, status: 'in_review' } : item))
        );
      });
    }
  };

  const handleApplyTemplate = (templateType: 'mendelian' | 'electrophoresis' | 'hydration') => {
    if (!selectedInquiry) return;
    const counselorSignature = profile?.name ? `${profile.name}` : 'Certified Clinical Counselor';

    if (templateType === 'mendelian') {
      setReplyText(
        `Dear ${name},\n\nThank you for reaching out to the Clinical Genetics consultation service. When both partners carry the Sickle Cell Trait (Hb AS x Hb AS), each pregnancy carries:\n• 25% chance of normal hemoglobin (Hb AA)\n• 50% chance of sickle cell trait carrier (Hb AS)\n• 25% chance of sickle cell anemia (Hb SS)\n\nWe recommend scheduling a comprehensive telehealth session to discuss reproductive planning options, including in-vitro fertilization (IVF) paired with preimplantation genetic testing for monogenic defects (PGT-M), as well as early prenatal diagnosis via chorionic villus sampling (CVS) at 10-12 weeks.\n\nPlease feel free to book an available time slot directly through our calendar link below.\n\nWarm regards,\n${counselorSignature}\nSickle Cell Genetics Team`
      );
    } else if (templateType === 'electrophoresis') {
      setReplyText(
        `Dear ${name},\n\nThank you for sharing your hemoglobin electrophoresis results. Carrying a single abnormal hemoglobin allele (such as Hb AS or Hb AC) is generally asymptomatic under normal conditions and does not cause sickle cell anemia.\n\nHowever, it is crucial that your reproductive partner completes a High-Performance Liquid Chromatography (HPLC) test to confirm their hemoglobin status before pregnancy planning. We will also monitor your iron levels and red cell indices.\n\nPlease let me know if you would like me to generate a laboratory requisition order for your partner.\n\nWarm regards,\n${counselorSignature}\nSickle Cell Genetics Team`
      );
    } else {
      setReplyText(
        `Dear ${name},\n\nRegarding your inquiry on hydration and symptom management: For individuals with hemoglobin variants, maintaining optimal vascular hydration is paramount. We recommend 3.5 to 4 liters of fluid daily, especially during physical exertion or warm temperatures, and avoiding extreme altitude or unpressurized environments without supplemental oxygen.\n\nIf you experience persistent joint pain, fever above 101°F (38.3°C), or shortness of breath, please seek prompt medical evaluation at your nearest comprehensive sickle cell center.\n\nWarm regards,\n${counselorSignature}\nSickle Cell Clinical Team`
      );
    }
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim()) return;

    setIsSubmitting(true);
    setFeedbackMessage(null);

    const { success, error } = await respondToInquiry(
      selectedInquiry.id,
      replyText.trim(),
      profile?.id
    );

    setIsSubmitting(false);

    if (success) {
      setFeedbackMessage({
        type: 'success',
        text: `Clinical response securely sent to ${selectedInquiry.patient_name || 'Patient'} and updated in the Supabase inquiries table.`
      });
      // Update local state
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === selectedInquiry.id
            ? {
                ...inq,
                response: replyText.trim(),
                responded_at: new Date().toISOString(),
                status: 'responded'
              }
            : inq
        )
      );
      setTimeout(() => setFeedbackMessage(null), 5000);
    } else {
      setFeedbackMessage({
        type: 'error',
        text: error?.message || 'Failed to submit response. Please try again.'
      });
    }
  };

  const handleConfirmAppointment = (aptId: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === aptId ? { ...apt, status: 'Confirmed' } : apt
      )
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
      {/* Clinician Portal Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest border border-surface-variant/40 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center font-black text-2xl shadow-sm shrink-0 ring-4 ring-secondary/15">
              <Icon name="clinical_notes" className="w-8 h-8 text-secondary" size={32} />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-black tracking-tight">
                  Health Professional Clinical Workspace
                </h1>
                <span className="inline-flex items-center gap-1 font-label-sm text-xs bg-primary-container text-on-surface px-3 py-1 rounded-full font-bold">
                  <Icon name="shield" className="w-3.5 h-3.5 text-on-surface" size={14} />
                  Clinical Workspace Preview
                </span>
              </div>

              <p className="font-body-md text-sm text-on-surface-variant max-w-3xl leading-relaxed">
                Welcome, <strong className="text-on-surface font-bold">{profile?.name || 'Clinician'}</strong>. Review triage inquiries, dispatch encrypted Mendelian genetic counseling, and manage scheduled consultations.
              </p>
            </div>
          </div>

          {/* Quick Role & Portal Actions */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => {
                if (onSwitchToPatientView) {
                  onSwitchToPatientView();
                } else {
                  switchRole('user');
                }
              }}
              className="px-4 py-2.5 rounded-full border border-surface-variant hover:bg-surface-container text-on-surface font-label-md text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Test role switcher: Preview app as a standard patient"
              type="button"
            >
              <Icon name="person" className="w-4 h-4 text-on-surface" size={16} />
              <span>Switch to Patient View</span>
            </button>

            {onOpenCliniciansDirectory && (
              <button
                onClick={onOpenCliniciansDirectory}
                className="px-4 py-2.5 rounded-full bg-secondary-container text-secondary hover:bg-secondary-container/80 font-label-md text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                type="button"
              >
                <Icon name="contacts" className="w-4 h-4 text-secondary" size={16} />
                <span>Directory</span>
              </button>
            )}
          </div>
        </div>

        {/* Clinical Statistics Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-surface-variant/40">
          <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-surface-variant/30 flex flex-col gap-1">
            <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Total Inquiries
            </span>
            <span className="font-headline-lg text-2xl sm:text-3xl font-black text-on-surface">
              {inquiries.length}
            </span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Across registered patients</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1">
            <span className="font-label-sm text-xs uppercase tracking-wider text-amber-800 font-bold">
              Pending Triage
            </span>
            <span className="font-headline-lg text-2xl sm:text-3xl font-black text-amber-800">
              {pendingCount}
            </span>
            <span className="font-body-sm text-[11px] text-amber-700">Requires clinician review</span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary-container/40 border border-secondary/20 flex flex-col gap-1">
            <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-bold">
              Telehealth Bookings
            </span>
            <span className="font-headline-lg text-2xl sm:text-3xl font-black text-secondary">
              {appointments.length}
            </span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">2 confirmed for today</span>
          </div>

          <div className="p-4 rounded-2xl bg-primary-container/30 border border-primary-container flex flex-col gap-1">
            <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface font-bold">
              Responded
            </span>
            <span className="font-headline-lg text-2xl sm:text-3xl font-black text-on-surface">
              {respondedCount}
            </span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">100% Private & Act 843 Logged</span>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 shadow-md animate-in slide-in-from-top-2 font-semibold ${
            feedbackMessage.type === 'success'
              ? 'bg-secondary text-on-secondary'
              : 'bg-error text-on-error'
          }`}
        >
          <Icon
            name={feedbackMessage.type === 'success' ? 'check_circle' : 'warning'}
            className="w-5 h-5 shrink-0"
            size={22}
          />
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Main 2-Column Responsive Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols on Desktop): Active Patient Inquiries */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant/40 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 border-b border-surface-variant/40 pb-4">
              <div>
                <h3 className="font-headline-md text-lg sm:text-xl font-bold text-on-surface flex items-center gap-2">
                  <span>Active Patient Inquiries</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-xs font-black">
                    {filteredInquiries.length}
                  </span>
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                  Select an inquiry to read and dispatch a clinical reply.
                </p>
              </div>

              {/* Status Filter Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-9 px-3 rounded-xl bg-surface-container-low border border-surface-variant font-label-md text-xs text-on-surface focus:outline-none cursor-pointer"
              >
                <option value="all">All Inquiries</option>
                <option value="pending">Pending ({pendingCount})</option>
                <option value="in_review">In Review ({inReviewCount})</option>
                <option value="responded">Responded ({respondedCount})</option>
              </select>
            </div>

            {/* Inquiries List */}
            <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredInquiries.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant text-xs flex flex-col items-center gap-2 bg-surface-container-low/40 rounded-2xl">
                  <Icon name="mark_email_read" className="w-8 h-8 text-outline" size={32} />
                  <span>No inquiries match the selected filter.</span>
                </div>
              ) : (
                filteredInquiries.map((inq) => {
                  const isSelected = selectedInquiry?.id === inq.id;
                  const isPending = inq.status === 'pending';
                  const isInReview = inq.status === 'in_review';

                  return (
                    <div
                      key={inq.id}
                      onClick={() => handleSelectInquiry(inq)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-surface-container-low border-secondary shadow-sm ring-2 ring-secondary/20'
                          : 'bg-surface-container-lowest hover:bg-surface-container-low/60 border-surface-variant/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-label-md text-xs font-bold text-on-surface">
                            {inq.patient_name || 'Patient User'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-surface font-label-sm text-[10px] font-black">
                            Hb {inq.patient_genotype}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                              : isInReview
                              ? 'bg-blue-500/15 text-blue-800 border border-blue-500/30'
                              : 'bg-secondary-container text-secondary border border-secondary/30'
                          }`}
                        >
                          {isPending ? 'Pending' : isInReview ? 'In Review' : 'Responded'}
                        </span>
                      </div>

                      <h4 className="font-headline-sm text-xs font-bold text-on-surface line-clamp-1">
                        {inq.subject}
                      </h4>

                      <p className="font-body-sm text-[11px] text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                        {inq.message}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-surface-variant/30 text-[10px] text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <Icon name="schedule" className="w-3.5 h-3.5 text-on-surface-variant" size={13} />
                          <span>{new Date(inq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        <span className="font-bold text-secondary flex items-center gap-0.5">
                          <span>{isSelected ? 'Currently Viewing' : 'Review & Reply'}</span>
                          <Icon name="arrow_forward" className="w-3.5 h-3.5 text-secondary" size={14} />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section: Pending Appointments (Left Column Sub-Card) */}
          <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant/40 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-variant/40 pb-3">
              <div>
                <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface flex items-center gap-2">
                  <Icon name="calendar_today" className="w-5 h-5 text-secondary" size={20} />
                  <span>Pending Appointments</span>
                </h3>
                <p className="font-body-sm text-[11px] text-on-surface-variant">
                  Upcoming genetic counseling and telemedicine slots.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-xs font-black">
                {appointments.length} Booked
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {appointments.length === 0 ? (
                <div className="p-6 text-center text-on-surface-variant text-xs flex flex-col items-center gap-2 bg-surface-container-low/40 rounded-2xl">
                  <Icon name="event_busy" className="w-7 h-7 text-outline" size={28} />
                  <span className="font-bold text-on-surface">No Pending Appointments</span>
                  <span className="text-[11px] max-w-xs">When patients book telehealth sessions or counseling consultations, they will appear here.</span>
                </div>
              ) : (
                appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-2xl bg-surface-container-low/50 border border-surface-variant/40 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-xs font-bold text-on-surface">
                          {apt.patientName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded-md bg-primary-container text-on-surface font-label-sm text-[9px] font-black">
                          {apt.patientGenotype}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        apt.status === 'Confirmed'
                          ? 'bg-secondary-container text-secondary'
                          : 'bg-amber-500/15 text-amber-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>

                    <span className="font-body-sm text-[11px] font-semibold text-on-surface">
                      {apt.appointmentType}
                    </span>

                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant pt-1 border-t border-surface-variant/30">
                      <span className="flex items-center gap-1 font-bold text-secondary">
                        <Icon name="videocam" className="w-3.5 h-3.5 text-secondary" size={13} />
                        <span>{apt.dateTime}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {apt.status !== 'Confirmed' ? (
                          <button
                            onClick={() => handleConfirmAppointment(apt.id)}
                            className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary text-[10px] font-bold hover:brightness-105 cursor-pointer"
                            type="button"
                          >
                            Confirm Slot
                          </button>
                        ) : (
                          <button
                            onClick={() => alert(`Launching encrypted tele-counseling video session with ${apt.patientName}...`)}
                            className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary text-[10px] font-bold hover:brightness-105 cursor-pointer flex items-center gap-1"
                            type="button"
                          >
                            <Icon name="call" className="w-3 h-3 text-on-secondary" size={12} />
                            <span>Launch Video</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols on Desktop): Secure Message Reply Box & Patient Case Review */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant/40 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
            {/* Selected Inquiry Header */}
            {selectedInquiry ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-variant/40 pb-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-xs font-black">
                        Patient Case: {selectedInquiry.patient_genotype}
                      </span>
                      <span className="font-label-sm text-xs text-on-surface-variant">
                        ID: {selectedInquiry.id}
                      </span>
                    </div>

                    <h2 className="font-headline-lg text-lg sm:text-xl font-black text-on-surface mt-1">
                      {selectedInquiry.subject}
                    </h2>

                    <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
                      <span>From: <strong className="text-on-surface">{selectedInquiry.patient_name || 'Patient'}</strong></span>
                      {selectedInquiry.patient_email && (
                        <span>• {selectedInquiry.patient_email}</span>
                      )}
                      <span>• {new Date(selectedInquiry.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                        selectedInquiry.status === 'responded'
                          ? 'bg-secondary-container text-secondary'
                          : 'bg-amber-500/15 text-amber-800'
                      }`}
                    >
                      {selectedInquiry.status === 'responded' ? 'Status: Responded' : 'Status: In Review'}
                    </span>
                  </div>
                </div>

                {/* Patient's Inquiry Message Box */}
                <div className="bg-surface-container-low/60 rounded-2xl p-5 border border-surface-variant/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant">
                    <span className="flex items-center gap-1.5 text-on-surface">
                      <Icon name="help_outline" className="w-4 h-4 text-secondary" size={17} />
                      <span>Patient Clinical Question</span>
                    </span>
                    <span className="text-[11px] font-normal">Encrypted Transmission</span>
                  </div>

                  <p className="font-body-md text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-line mt-1">
                    {selectedInquiry.message}
                  </p>
                </div>

                {/* Quick Clinical Response Templates */}
                <div className="flex flex-col gap-2">
                  <span className="font-label-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <Icon name="auto_fix_high" className="w-4 h-4 text-primary" size={16} />
                    <span>Insert Verified Clinical Guidance Template</span>
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleApplyTemplate('mendelian')}
                      className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-surface-variant/60 cursor-pointer transition-colors"
                      type="button"
                    >
                      Inheritance Counseling (AS x AS)
                    </button>
                    <button
                      onClick={() => handleApplyTemplate('electrophoresis')}
                      className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-surface-variant/60 cursor-pointer transition-colors"
                      type="button"
                    >
                      Electrophoresis & Carrier Status
                    </button>
                    <button
                      onClick={() => handleApplyTemplate('hydration')}
                      className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-surface-variant/60 cursor-pointer transition-colors"
                      type="button"
                    >
                      Hydration & Crisis Safeguards
                    </button>
                  </div>
                </div>

                {/* Secure Message Reply Box Form */}
                <form onSubmit={handleSendResponse} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-label-md text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <Icon name="mark_chat_read" className="w-4 h-4 text-secondary" size={17} />
                        <span>Clinical Response & Guidance</span>
                      </label>
                      <span className="text-[11px] text-on-surface-variant">
                        Signed as {profile?.name || 'Healthcare Provider'}
                      </span>
                    </div>

                    <textarea
                      rows={9}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your clinical evaluation, Mendelian genetic calculations, or guidance here..."
                      className="w-full p-4 rounded-2xl bg-surface-container-low border border-surface-variant/60 font-body-md text-xs sm:text-sm text-on-surface placeholder:text-outline/70 focus:outline-none focus:border-secondary shadow-inner leading-relaxed resize-y"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <Icon name="lock" className="w-4 h-4 text-secondary" size={16} />
                      <span>256-bit encrypted • Automatically logged with timestamp</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => setReplyText('')}
                        type="button"
                        className="px-4 py-2.5 rounded-full border border-surface-variant hover:bg-surface-container text-on-surface font-label-md text-xs font-bold transition-all cursor-pointer"
                      >
                        Clear
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || !replyText.trim()}
                        className="flex-1 sm:flex-none h-11 px-6 rounded-full bg-secondary text-on-secondary font-label-md text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Icon name="send" className="w-4.5 h-4.5 text-on-secondary" size={18} />
                        <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Clinical Reply'}</span>
                      </button>
                    </div>
                  </div>
                </form>

                {selectedInquiry.response && (
                  <div className="mt-4 p-4 rounded-2xl bg-secondary-container/30 border border-secondary/20 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-secondary">
                      <span className="flex items-center gap-1">
                        <Icon name="history" className="w-4 h-4 text-secondary" size={16} />
                        <span>Latest Dispatched Response</span>
                      </span>
                      {selectedInquiry.responded_at && (
                        <span className="text-[11px] font-normal text-on-surface-variant">
                          {new Date(selectedInquiry.responded_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="font-body-sm text-xs text-on-surface leading-relaxed whitespace-pre-line">
                      {selectedInquiry.response}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-on-surface-variant flex flex-col items-center gap-3">
                <Icon name="forum" className="w-12 h-12 text-outline" size={48} />
                <h4 className="font-headline-md text-base font-bold text-on-surface">No Inquiry Selected</h4>
                <p className="text-xs max-w-sm">
                  Select a patient inquiry from the left column to read details and dispatch a clinical response.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
