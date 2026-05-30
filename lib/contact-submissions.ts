import { supabaseServer } from '@/lib/supabase-server';
import {
  isPropertyHostingSubject,
  type ContactFormPayload,
  type PropertyHostingDetails,
} from '@/lib/contact-form';

export interface ContactSubmissionRecord {
  id: string;
  name: string;
  email: string;
  company: string | null;
  subject: string;
  message: string | null;
  is_property_hosting: boolean;
  property_details: PropertyHostingDetails | null;
  email_sent: boolean;
  created_at: string;
  updated_at: string;
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function saveContactSubmission(
  payload: ContactFormPayload
): Promise<{ id: string } | null> {
  if (!supabaseServer) {
    console.error('Contact submission skipped: Supabase is not configured');
    return null;
  }

  const isPropertyHosting = isPropertyHostingSubject(payload.subject);

  const { data, error } = await supabaseServer
    .from('contact_submissions')
    .insert({
      name: payload.name.trim(),
      email: payload.email.trim(),
      company: emptyToNull(payload.company),
      subject: payload.subject.trim(),
      message: emptyToNull(payload.message),
      is_property_hosting: isPropertyHosting,
      property_details: isPropertyHosting ? payload.propertyHosting ?? null : null,
      email_sent: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to save contact submission:', error);
    return null;
  }

  return data;
}

export async function markContactSubmissionEmailSent(id: string): Promise<void> {
  if (!supabaseServer) return;

  const { error } = await supabaseServer
    .from('contact_submissions')
    .update({ email_sent: true })
    .eq('id', id);

  if (error) {
    console.error('Failed to update contact submission email status:', error);
  }
}

export async function listContactSubmissions(): Promise<ContactSubmissionRecord[]> {
  if (!supabaseServer) {
    console.error('Contact submissions list skipped: Supabase is not configured');
    return [];
  }

  const { data, error } = await supabaseServer
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to list contact submissions:', error);
    return [];
  }

  return (data ?? []) as ContactSubmissionRecord[];
}
