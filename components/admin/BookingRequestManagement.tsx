'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  Calendar,
  User,
  Home,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Moon,
  Inbox,
} from 'lucide-react';
import { admin, statusBadge, paymentBadge } from '@/components/admin/ui/classes';
import { calculateNightsBetween } from '@/lib/pricing';

interface BookingRequest {
  id: string;
  booking_reference: string;
  check_in_date: string;
  check_out_date: string;
  nights?: number;
  booking_status: string;
  payment_status?: string;
  accommodation_total: number;
  cleaning_fee: number;
  extra_charges?: number;
  total_payout?: number;
  booking_date?: string;
  created_at?: string;
  notes: string | null;
  number_of_guests?: number | null;
  apartment: {
    apartment_number: string;
    address: string;
  } | null;
  guest: {
    name: string;
    email: string;
    phone: string;
  } | null;
  channel: {
    name: string;
  } | null;
}

function getNights(booking: BookingRequest): number {
  if (booking.nights != null && booking.nights > 0) {
    return booking.nights;
  }
  return calculateNightsBetween(booking.check_in_date, booking.check_out_date);
}

function getEstimatedTotal(booking: BookingRequest): number {
  if (booking.total_payout != null && booking.total_payout > 0) {
    return booking.total_payout;
  }
  return (
    (booking.accommodation_total || 0) +
    (booking.cleaning_fee || 0) +
    (booking.extra_charges || 0)
  );
}

function getSubmittedAt(booking: BookingRequest): string {
  return booking.created_at || booking.booking_date || '';
}

export default function BookingRequestManagement() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        const list = (Array.isArray(data) ? data : []) as BookingRequest[];
        const pendingDirect = list.filter(
          (b) =>
            b.booking_status === 'pending' &&
            (b.channel?.name || '').toLowerCase() === 'direct'
        );
        pendingDirect.sort((a, b) => {
          const aTime = new Date(getSubmittedAt(a) || a.check_in_date).getTime();
          const bTime = new Date(getSubmittedAt(b) || b.check_in_date).getTime();
          return bTime - aTime;
        });
        setRequests(pendingDirect);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const updateRequestStatus = async (
    booking: BookingRequest,
    booking_status: 'confirmed' | 'cancelled'
  ) => {
    const label = booking_status === 'confirmed' ? 'confirm' : 'decline';
    if (
      !confirm(
        `Are you sure you want to ${label} booking request ${booking.booking_reference}?`
      )
    ) {
      return;
    }

    setUpdatingId(booking.id);
    try {
      const response = await fetch(`/api/admin/bookings?id=${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_status,
          payment_status: booking.payment_status || 'pending',
          confirmRequest: booking_status === 'confirmed',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${label} booking request`);
      }

      setMessage({
        type: 'success',
        text:
          booking_status === 'confirmed'
            ? 'Booking request marked as confirmed.'
            : 'Booking request declined.',
      });
      fetchRequests();
      setShowDetailsModal(false);
      setTimeout(() => setMessage(null), 4000);
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : `Error updating request`;
      setMessage({ type: 'error', text });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderActions = (booking: BookingRequest, compact = false) => {
    const busy = updatingId === booking.id;

    if (compact) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedRequest(booking);
              setShowDetailsModal(true);
            }}
            className={`${admin.btnSecondary} flex-1 min-w-[5.5rem] py-2 text-sm`}
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => updateRequestStatus(booking, 'confirmed')}
            className={`${admin.btnPrimary} flex-1 min-w-[5.5rem] py-2 text-sm`}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Confirm
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => updateRequestStatus(booking, 'cancelled')}
            className={`${admin.btnDanger} flex-1 min-w-[5.5rem] py-2 text-sm`}
          >
            <XCircle className="w-4 h-4" />
            Decline
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-end gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => {
            setSelectedRequest(booking);
            setShowDetailsModal(true);
          }}
          className={admin.iconBtnBlue}
          title="View details"
          aria-label="View booking request"
        >
          <Eye className="w-5 h-5" />
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => updateRequestStatus(booking, 'confirmed')}
          className={admin.iconBtnGreen}
          title="Mark as confirmed"
          aria-label="Confirm booking request"
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => updateRequestStatus(booking, 'cancelled')}
          className={admin.iconBtnRed}
          title="Mark as declined"
          aria-label="Decline booking request"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className={admin.spinner} />
      </div>
    );
  }

  const emptyState = (
    <div className={admin.empty}>
      <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <p>No pending booking requests from the website.</p>
      <p className="text-sm text-slate-500 mt-1">
        New direct booking requests will appear here for review.
      </p>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 lg:p-8">
      {message && (
        <div
          className={`mb-4 sm:mb-6 ${message.type === 'success' ? admin.alertSuccess : admin.alertError}`}
          role="status"
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm sm:text-base">{message.text}</span>
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <p className="text-sm text-slate-600">
          Pending direct website booking requests awaiting your review. Confirmed or declined
          requests move to the Bookings tab.
        </p>
        <p className="text-sm font-medium text-slate-900 mt-2">
          {requests.length} pending request{requests.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="md:hidden space-y-3">
        {requests.length === 0
          ? emptyState
          : requests.map((booking) => (
              <article key={booking.id} className={`${admin.card} p-4 space-y-3`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-slate-900 truncate">
                      {booking.booking_reference}
                    </p>
                    <p className="text-sm text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 shrink-0 text-violet-500" />
                      <span className="truncate">{booking.guest?.name || 'N/A'}</span>
                    </p>
                    <p className="text-xs text-slate-500 truncate">{booking.guest?.email}</p>
                  </div>
                  <span className={statusBadge(booking.booking_status)}>{booking.booking_status}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Property</p>
                    <p className="text-slate-900">{booking.apartment?.apartment_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Guests</p>
                    <p className="text-slate-900">{booking.number_of_guests ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Check-in</p>
                    <p className="text-slate-900">{formatDate(booking.check_in_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Check-out</p>
                    <p className="text-slate-900">{formatDate(booking.check_out_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Nights</p>
                    <p className="text-slate-900 flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5" />
                      {getNights(booking)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Est. total</p>
                    <p className="text-slate-900 font-semibold">{formatCurrency(getEstimatedTotal(booking))}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100">{renderActions(booking, true)}</div>
              </article>
            ))}
      </div>

      <div className={`hidden md:block ${admin.tableWrap}`}>
        {requests.length === 0 ? (
          emptyState
        ) : (
          <table className={admin.table}>
            <thead className={admin.thead}>
              <tr>
                <th className={admin.th}>Reference</th>
                <th className={admin.th}>Guest</th>
                <th className={admin.th}>Property</th>
                <th className={admin.th}>Check-in</th>
                <th className={admin.th}>Check-out</th>
                <th className={admin.th}>Nights</th>
                <th className={admin.th}>Guests</th>
                <th className={admin.th}>Est. total</th>
                <th className={admin.th}>Submitted</th>
                <th className={`${admin.th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className={admin.tbody}>
              {requests.map((booking) => (
                <tr key={booking.id} className={admin.tr}>
                  <td className={`${admin.td} font-mono text-xs font-medium`}>
                    {booking.booking_reference}
                  </td>
                  <td className={admin.td}>
                    <div className="font-medium text-slate-900">{booking.guest?.name || 'N/A'}</div>
                    <div className="text-xs text-slate-500">{booking.guest?.email}</div>
                  </td>
                  <td className={admin.td}>{booking.apartment?.apartment_number || 'N/A'}</td>
                  <td className={admin.td}>{formatDate(booking.check_in_date)}</td>
                  <td className={admin.td}>{formatDate(booking.check_out_date)}</td>
                  <td className={admin.td}>{getNights(booking)}</td>
                  <td className={admin.td}>{booking.number_of_guests ?? '—'}</td>
                  <td className={`${admin.td} font-semibold`}>
                    {formatCurrency(getEstimatedTotal(booking))}
                  </td>
                  <td className={admin.td}>{formatDate(getSubmittedAt(booking))}</td>
                  <td className={admin.td}>{renderActions(booking)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showDetailsModal && selectedRequest && (
        <div className={admin.modalOverlayScroll} role="dialog" aria-modal="true">
          <div className="min-h-full flex items-end sm:items-start justify-center py-4 sm:py-8">
            <div className={`${admin.modalPanel} w-full max-w-3xl flex flex-col max-h-[min(90vh,calc(100dvh-2rem))]`}>
              <div className={`${admin.modalHeader} shrink-0 px-4 sm:px-6 py-4`}>
                <div className="min-w-0 pr-3">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">Booking request</h3>
                  <p className="text-sm text-slate-500 font-mono truncate">
                    {selectedRequest.booking_reference}
                  </p>
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
                  <span className={statusBadge(selectedRequest.booking_status)}>
                    {selectedRequest.booking_status}
                  </span>
                  {selectedRequest.payment_status && (
                    <span className={paymentBadge(selectedRequest.payment_status)}>
                      {selectedRequest.payment_status}
                    </span>
                  )}
                </div>

                <section className={`${admin.cardMuted} p-4`}>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-violet-600" /> Guest
                  </h4>
                  <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Name</dt>
                      <dd className="text-slate-900 font-medium">{selectedRequest.guest?.name || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Email</dt>
                      <dd className="text-slate-900 break-all">{selectedRequest.guest?.email || 'N/A'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500">Phone</dt>
                      <dd className="text-slate-900">{selectedRequest.guest?.phone || 'N/A'}</dd>
                    </div>
                  </dl>
                </section>

                <section className={`${admin.cardMuted} p-4`}>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Home className="w-5 h-5 text-right-stay-600" /> Property
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-slate-500">Apartment</dt>
                      <dd className="text-slate-900 font-medium">
                        {selectedRequest.apartment?.apartment_number || 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Address</dt>
                      <dd className="text-slate-900">{selectedRequest.apartment?.address || 'N/A'}</dd>
                    </div>
                  </dl>
                </section>

                <section className={`${admin.cardMuted} p-4`}>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" /> Stay
                  </h4>
                  <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Check-in</dt>
                      <dd className="text-slate-900 font-medium">{formatDate(selectedRequest.check_in_date)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Check-out</dt>
                      <dd className="text-slate-900 font-medium">{formatDate(selectedRequest.check_out_date)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Nights</dt>
                      <dd className="text-slate-900 font-medium">{getNights(selectedRequest)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Guests</dt>
                      <dd className="text-slate-900 font-medium">{selectedRequest.number_of_guests ?? '—'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500">Submitted</dt>
                      <dd className="text-slate-900">{formatDate(getSubmittedAt(selectedRequest))}</dd>
                    </div>
                  </dl>
                </section>

                <section className={`${admin.cardMuted} p-4`}>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-600" /> Estimated total
                  </h4>
                  <p className="text-2xl font-bold text-right-stay-600">
                    {formatCurrency(getEstimatedTotal(selectedRequest))}
                  </p>
                </section>

                {selectedRequest.notes && (
                  <section className={`${admin.cardMuted} p-4`}>
                    <h4 className="text-base font-semibold text-slate-900 mb-2">Special requests</h4>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap">{selectedRequest.notes}</p>
                  </section>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowDetailsModal(false)} className={admin.btnGhost}>
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === selectedRequest.id}
                    onClick={() => updateRequestStatus(selectedRequest, 'cancelled')}
                    className={admin.btnDanger}
                  >
                    <XCircle className="w-5 h-5" />
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === selectedRequest.id}
                    onClick={() => updateRequestStatus(selectedRequest, 'confirmed')}
                    className={admin.btnPrimary}
                  >
                    {updatingId === selectedRequest.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Mark confirmed
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
