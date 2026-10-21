import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Inquiry, InquiryStatus, Genotype } from '../types/database';

const LOCAL_STORAGE_KEY = 'sc_clinical_inquiries';

export const getInquiries = async (): Promise<Inquiry[]> => {
  if (!isSupabaseConfigured) {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        users:user_id (
          name,
          email,
          genotype
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching inquiries from Supabase, checking local cache:', error.message);
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => ({
      ...item,
      patient_name: item.users?.name || item.patient_name || 'Patient User',
      patient_email: item.users?.email || item.patient_email || '',
      patient_genotype: item.patient_genotype || item.users?.genotype || 'Unknown',
    }));
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    return [];
  }
};

export const submitInquiry = async (
  userId: string,
  subject: string,
  message: string,
  patientGenotype: Genotype,
  patientName?: string,
  patientEmail?: string
): Promise<{ data: Inquiry | null; error: Error | null }> => {
  const newInquiry: Inquiry = {
    id: `inq-${Date.now()}`,
    user_id: userId,
    patient_name: patientName || 'Patient User',
    patient_email: patientEmail || '',
    patient_genotype: patientGenotype,
    subject,
    message,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured) {
    const current = await getInquiries();
    const updated = [newInquiry, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return { data: newInquiry, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        user_id: userId,
        subject,
        message,
        patient_genotype: patientGenotype,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.warn('Supabase insert failed, saving locally:', error.message);
      const current = await getInquiries();
      const updated = [newInquiry, ...current];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return { data: newInquiry, error: null };
    }

    return { data: data as Inquiry, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
};

export const respondToInquiry = async (
  inquiryId: string,
  responseMessage: string,
  professionalId?: string
): Promise<{ success: boolean; error: Error | null }> => {
  const respondedAt = new Date().toISOString();

  if (!isSupabaseConfigured) {
    const current = await getInquiries();
    const updated = current.map((inq) =>
      inq.id === inquiryId
        ? {
            ...inq,
            response: responseMessage,
            responded_at: respondedAt,
            status: 'responded' as InquiryStatus,
            professional_id: professionalId || inq.professional_id
          }
        : inq
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from('inquiries')
      .update({
        response: responseMessage,
        responded_at: respondedAt,
        status: 'responded',
        professional_id: professionalId || null,
        updated_at: respondedAt
      })
      .eq('id', inquiryId);

    if (error) {
      console.warn('Supabase update failed, saving locally:', error.message);
      const current = await getInquiries();
      const updated = current.map((inq) =>
        inq.id === inquiryId
          ? {
              ...inq,
              response: responseMessage,
              responded_at: respondedAt,
              status: 'responded' as InquiryStatus,
              professional_id: professionalId || inq.professional_id
            }
          : inq
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err as Error };
  }
};

export const updateInquiryStatus = async (
  inquiryId: string,
  status: InquiryStatus
): Promise<{ success: boolean; error: Error | null }> => {
  if (!isSupabaseConfigured) {
    const current = await getInquiries();
    const updated = current.map((inq) =>
      inq.id === inquiryId ? { ...inq, status } : inq
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from('inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', inquiryId);

    if (error) {
      console.warn('Supabase status update failed, saving locally:', error.message);
    }
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err as Error };
  }
};
