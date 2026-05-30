'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Eye,
  Loader2,
  Mail,
  MailCheck,
  MailX,
  User,
  X,
} from 'lucide-react';
import { admin } from '@/components/admin/ui/classes';
import { getContactSubjectLabel, type PropertyHostingDetails } from '@/lib/contact-form';

interface ContactSubmission {
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
}

type FilterType = 'all' | 'property' | 'general';

const PROPERTY_DETAIL_FIELDS: { key: keyof PropertyHostingDetails; label: string }[] = [
  { key: 'ownerName', label: 'Owner name' },
  { key: 'ownerEmail', label: 'Owner email' },
  { key: 'ownerPhone', label: 'Owner phone' },
  { key: 'location', label: 'Location' },
  { key: 'areaSuburb', label: 'Area / suburb' },
  { key: 'buildingName', label: 'Building' },
  { key: 'unitNumber', label: 'Unit' },
  { key: 'propertyType', label: 'Property type' },
  { key: 'bedrooms', label: 'Bedrooms' },
  { key: 'bathrooms', label: 'Bathrooms' },
  { key: 'parking', label: 'Parking' },
  { key: 'furnishingStatus', label: 'Furnishing' },
  { key: 'currentlyListed', label: 'Listed on' },
  { key: 'preferredStartDate', label: 'Start date' },
  { key: 'monthlyRentalIncome', label: 'Average monthly rental' },
  { key: 'propertyCondition', label: 'Condition' },
  { key: 'hasWifi', label: 'WiFi' },
  { key: 'hasWashingMachine', label: 'Washing machine' },
  { key: 'hasAirConditioning', label: 'Air conditioning' },
  { key: 'hasBackupPower', label: 'Backup power' },
  { key: 'propertyDescription', label: 'Description' },
  { key: 'additionalNotes', label: 'Notes' },
];

function formatDateTime(dateString: string): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function typeBadge(isProperty: boolean): string {
  const base = 'px-2.5 py-0.5 text-xs font-medium rounded-full border';
  return isProperty
    ? `${base} bg-emerald-50 text-emerald-700 border-emerald-200`
    : `${base} bg-slate-50 text-slate-600 border-slate-200`;
}

function emailBadge(sent: boolean): string {
  const base = 'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border';
  return sent
    ? `${base} bg-green-50 text-green-700 border-green-200`
    : `${base} bg-amber-50 text-amber-700 border-amber-200`;
}

function DetailField({ label, value }: { label: string; value: string | null | undefined }) {
  const display = value?.trim() || '—';
  const isLong = display.length > 80;

  return (
    <div className={isLong ? 'sm:col-span-2' : undefined}>
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-slate-900 font-medium ${isLong ? 'whitespace-pre-wrap break-words' : 'break-all'}`}>
        {display}
      </dd>
    </div>
  );
}

export default function ContactSubmissionManagement() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/contact-submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(Array.isArray(data) ? data : []);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const filteredSubmissions = useMemo(() => {
    if (filter === 'property') {
      return submissions.filter((item) => item.is_property_hosting);
    }
    if (filter === 'general') {
      return submissions.filter((item) => !item.is_property_hosting);
    }
    return submissions;
  }, [filter, submissions]);

  const propertyCount = submissions.filter((item) => item.is_property_hosting).length;
  const generalCount = submissions.length - propertyCount;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className={admin.spinner} />
      </div>
    );
  }

  const emptyState = (
    <div className={admin.empty}>
      <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <p>No contact form submissions yet.</p>
      <p className="text-sm text-slate-500 mt-1">
        Enquiries from the Get In Touch page will appear here.
      </p>
    </div>
  );

  const filterButtonClass = (active: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
      active
        ? 'bg-right-stay-50 text-right-stay-700 border-right-stay-200'
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
    }`;

  return (
    <div className="p-3 sm:p-4 lg:p-8">
      <div className="mb-4 sm:mb-6 space-y-4">
        <p className="text-sm text-slate-600">
          Contact form submissions from the website, including List My Property enquiries with full
          property details.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setFilter('all')} className={filterButtonClass(filter === 'all')}>
            All ({submissions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('property')}
            className={filterButtonClass(filter === 'property')}
          >
            Property listings ({propertyCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('general')}
            className={filterButtonClass(filter === 'general')}
          >
            General ({generalCount})
          </button>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filteredSubmissions.length === 0
          ? emptyState
          : filteredSubmissions.map((submission) => (
              <article key={submission.id} className={`${admin.card} p-4 space-y-3`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{submission.name}</p>
                    <p className="text-sm text-slate-600 truncate">{submission.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {getContactSubjectLabel(submission.subject)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={typeBadge(submission.is_property_hosting)}>
                      {submission.is_property_hosting ? 'Property' : 'General'}
                    </span>
                    <span className={emailBadge(submission.email_sent)}>
                      {submission.email_sent ? (
                        <>
                          <MailCheck className="w-3 h-3" /> Sent
                        </>
                      ) : (
                        <>
                          <MailX className="w-3 h-3" /> Not sent
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">{formatDateTime(submission.created_at)}</div>
                {submission.is_property_hosting && submission.property_details?.areaSuburb ? (
                  <p className="text-sm text-slate-700">
                    <Building2 className="inline w-3.5 h-3.5 mr-1 text-right-stay-600" />
                    {submission.property_details.areaSuburb}
                    {submission.property_details.propertyType
                      ? ` · ${submission.property_details.propertyType}`
                      : ''}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setShowDetailsModal(true);
                  }}
                  className={`${admin.btnSecondary} w-full py-2 text-sm`}
                >
                  <Eye className="w-4 h-4" />
                  View details
                </button>
              </article>
            ))}
      </div>

      <div className={`hidden md:block ${admin.tableWrap}`}>
        {filteredSubmissions.length === 0 ? (
          emptyState
        ) : (
          <table className={admin.table}>
            <thead className={admin.thead}>
              <tr>
                <th className={admin.th}>Submitted</th>
                <th className={admin.th}>Name</th>
                <th className={admin.th}>Email</th>
                <th className={admin.th}>Subject</th>
                <th className={admin.th}>Type</th>
                <th className={admin.th}>Property</th>
                <th className={admin.th}>Email</th>
                <th className={`${admin.th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className={admin.tbody}>
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className={admin.tr}>
                  <td className={admin.td}>{formatDateTime(submission.created_at)}</td>
                  <td className={`${admin.td} font-medium text-slate-900`}>{submission.name}</td>
                  <td className={admin.td}>
                    <a href={`mailto:${submission.email}`} className="text-right-stay-600 hover:underline">
                      {submission.email}
                    </a>
                  </td>
                  <td className={admin.td}>{getContactSubjectLabel(submission.subject)}</td>
                  <td className={admin.td}>
                    <span className={typeBadge(submission.is_property_hosting)}>
                      {submission.is_property_hosting ? 'Property' : 'General'}
                    </span>
                  </td>
                  <td className={admin.td}>
                    {submission.is_property_hosting && submission.property_details
                      ? `${submission.property_details.areaSuburb || '—'}${submission.property_details.propertyType ? ` · ${submission.property_details.propertyType}` : ''}`
                      : '—'}
                  </td>
                  <td className={admin.td}>
                    <span className={emailBadge(submission.email_sent)}>
                      {submission.email_sent ? 'Sent' : 'Not sent'}
                    </span>
                  </td>
                  <td className={admin.td}>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowDetailsModal(true);
                        }}
                        className={admin.iconBtnBlue}
                        title="View details"
                        aria-label="View contact submission"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showDetailsModal && selectedSubmission && (
        <div className={admin.modalOverlayScroll} role="dialog" aria-modal="true">
          <div className="min-h-full flex items-end sm:items-start justify-center py-4 sm:py-8">
            <div className={`${admin.modalPanel} w-full max-w-3xl flex flex-col max-h-[min(90vh,calc(100dvh-2rem))]`}>
              <div className={`${admin.modalHeader} shrink-0 px-4 sm:px-6 py-4`}>
                <div className="min-w-0 pr-3">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">Contact submission</h3>
                  <p className="text-sm text-slate-500">{formatDateTime(selectedSubmission.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className={`${admin.btnIcon} text-slate-500 hover:bg-slate-100`}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-4 sm:px-6 pb-6 pt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className={typeBadge(selectedSubmission.is_property_hosting)}>
                    {selectedSubmission.is_property_hosting ? 'Property listing' : 'General enquiry'}
                  </span>
                  <span className={emailBadge(selectedSubmission.email_sent)}>
                    {selectedSubmission.email_sent ? (
                      <>
                        <MailCheck className="w-3 h-3" /> Notification sent
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" /> Notification not sent
                      </>
                    )}
                  </span>
                </div>

                <section className={`${admin.cardMuted} p-4`}>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-violet-600" /> General Contact Info
                  </h4>
                  <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                    <DetailField label="Name" value={selectedSubmission.name} />
                    <DetailField
                      label="Email"
                      value={selectedSubmission.email}
                    />
                    <DetailField label="Company" value={selectedSubmission.company} />
                    <DetailField
                      label="Subject"
                      value={getContactSubjectLabel(selectedSubmission.subject)}
                    />
                    <DetailField label="Message" value={selectedSubmission.message} />
                  </dl>
                  <div className="mt-4">
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className={`${admin.btnSecondary} text-sm`}
                    >
                      <Mail className="w-4 h-4" />
                      Email {selectedSubmission.name}
                    </a>
                  </div>
                </section>

                {selectedSubmission.is_property_hosting && selectedSubmission.property_details ? (
                  <section className={`${admin.cardMuted} p-4`}>
                    <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-right-stay-600" /> Property Hosting Information
                    </h4>
                    <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                      {PROPERTY_DETAIL_FIELDS.map(({ key, label }) => (
                        <DetailField
                          key={key}
                          label={label}
                          value={
                            key === 'preferredStartDate'
                              ? formatDate(selectedSubmission.property_details?.[key] ?? '')
                              : selectedSubmission.property_details?.[key]
                          }
                        />
                      ))}
                    </dl>
                  </section>
                ) : null}

                <div className="flex justify-end pt-2">
                  <button type="button" onClick={() => setShowDetailsModal(false)} className={admin.btnGhost}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
