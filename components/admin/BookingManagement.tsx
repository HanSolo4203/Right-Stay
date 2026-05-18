'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  Calendar,
  User,
  Home,
  DollarSign,
  Filter,
  ChevronDown,
  Eye,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Moon,
} from 'lucide-react';
import { admin, statusBadge, paymentBadge } from '@/components/admin/ui/classes';

interface Booking {
  id: string;
  booking_reference: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  booking_status: string;
  payment_status?: string;
  payment_date?: string;
  payment_method?: string;
  payment_notes?: string;
  accommodation_total: number;
  cleaning_fee: number;
  total_payout: number;
  booking_date: string;
  notes: string;
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

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editFormData, setEditFormData] = useState({
    booking_status: '',
    payment_status: '',
    payment_date: '',
    payment_method: '',
    payment_notes: '',
  });

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      } else {
        // If API fails, set empty array to prevent errors
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = useCallback(() => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.booking_status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.booking_reference.toLowerCase().includes(query) ||
        (b.guest?.name || '').toLowerCase().includes(query) ||
        (b.apartment?.apartment_number || '').toLowerCase().includes(query) ||
        (b.channel?.name || '').toLowerCase().includes(query)
      );
    }

    // Sort by check-in date (most recent first)
    filtered.sort((a, b) => new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime());

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, searchQuery]);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter, searchQuery, filterBookings]);

  const formatDate = (dateString: string) => {
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

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditFormData({
      booking_status: booking.booking_status || '',
      payment_status: booking.payment_status || 'pending',
      payment_date: booking.payment_date || '',
      payment_method: booking.payment_method || '',
      payment_notes: booking.payment_notes || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      const response = await fetch(`/api/admin/bookings?id=${selectedBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking');
      }

      setMessage({ type: 'success', text: 'Booking updated successfully!' });
      setShowEditModal(false);
      fetchBookings();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error updating booking' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDelete = async (booking: Booking) => {
    // Only allow deletion for Direct bookings
    if (booking.channel?.name !== 'Direct') {
      setMessage({ 
        type: 'error', 
        text: 'Only Direct bookings can be deleted. Other bookings should be cancelled instead.' 
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    if (!confirm(`Are you sure you want to delete booking ${booking.booking_reference}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bookings?id=${booking.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete booking');
      }

      setMessage({ type: 'success', text: 'Booking deleted successfully!' });
      fetchBookings();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error deleting booking' });
      setTimeout(() => setMessage(null), 5000);
    }
  };



  const renderBookingActions = (booking: Booking, compact = false) => {
    const canDelete = booking.channel?.name === 'Direct';

    if (compact) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleViewDetails(booking)}
            className={`${admin.btnSecondary} flex-1 min-w-[5.5rem] py-2 text-sm`}
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            type="button"
            onClick={() => handleEdit(booking)}
            className={`${admin.btnSecondary} flex-1 min-w-[5.5rem] py-2 text-sm text-green-700 border-green-200 hover:bg-green-50`}
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={() => handleDelete(booking)}
              className={`${admin.btnDanger} flex-1 min-w-[5.5rem] py-2 text-sm`}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => handleViewDetails(booking)}
          className={admin.iconBtnBlue}
          title="View details"
          aria-label="View booking details"
        >
          <Eye className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => handleEdit(booking)}
          className={admin.iconBtnGreen}
          title="Edit status and payment"
          aria-label="Edit booking"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={() => handleDelete(booking)}
            className={admin.iconBtnRed}
            title="Delete booking"
            aria-label="Delete booking"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
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
      <p>No bookings found matching your filters.</p>
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

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search reference, guest, property, channel…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${admin.input} pl-10`}
            aria-label="Search bookings"
          />
        </div>
        <div className="relative w-full sm:w-auto sm:min-w-[11rem]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${admin.select} pl-10 pr-10 w-full`}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className={admin.statCard}>
          <p className="text-slate-500 text-xs sm:text-sm mb-1">Total Bookings</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{bookings.length}</p>
        </div>
        <div className={admin.statCard}>
          <p className="text-slate-500 text-xs sm:text-sm mb-1">Confirmed</p>
          <p className="text-xl sm:text-2xl font-bold text-green-700">
            {bookings.filter((b) => b.booking_status === 'confirmed').length}
          </p>
        </div>
        <div className={admin.statCard}>
          <p className="text-slate-500 text-xs sm:text-sm mb-1">Pending</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-700">
            {bookings.filter((b) => b.booking_status === 'pending').length}
          </p>
        </div>
        <div className={`${admin.statCard} col-span-2 lg:col-span-1`}>
          <p className="text-slate-500 text-xs sm:text-sm mb-1">Total Revenue</p>
          <p className="text-xl sm:text-2xl font-bold text-right-stay-600 truncate">
            {formatCurrency(bookings.reduce((sum, b) => sum + (b.total_payout || 0), 0))}
          </p>
        </div>
      </div>

      {filteredBookings.length > 0 && (
        <p className="text-sm text-slate-500 mb-3">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filteredBookings.length === 0
          ? emptyState
          : filteredBookings.map((booking) => (
              <article key={booking.id} className={`${admin.card} p-4 space-y-3`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-slate-900 truncate">
                      {booking.booking_reference}
                    </p>
                    <p className="text-sm text-slate-600 mt-0.5 flex items-center gap-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 shrink-0 text-violet-500" />
                      <span className="truncate">{booking.guest?.name || 'N/A'}</span>
                    </p>
                  </div>
                  <span className={statusBadge(booking.booking_status)}>{booking.booking_status}</span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Property</p>
                    <p className="text-slate-900 mt-0.5 flex items-center gap-1">
                      <Home className="w-3.5 h-3.5 text-right-stay-600 shrink-0" />
                      {booking.apartment?.apartment_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Channel</p>
                    <p className="text-slate-900 mt-0.5">{booking.channel?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Check-in</p>
                    <p className="text-slate-900 mt-0.5">{formatDate(booking.check_in_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Check-out</p>
                    <p className="text-slate-900 mt-0.5">{formatDate(booking.check_out_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nights</p>
                    <p className="text-slate-900 mt-0.5 flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {booking.nights}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total payout</p>
                    <p className="text-slate-900 font-semibold mt-0.5">{formatCurrency(booking.total_payout || 0)}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  {renderBookingActions(booking, true)}
                </div>
              </article>
            ))}
      </div>

      {/* Desktop table */}
      <div className={`hidden md:block ${admin.tableWrap}`}>
        <table className={admin.table}>
          <thead className={admin.thead}>
            <tr>
              <th className={admin.th}>Reference</th>
              <th className={admin.th}>Guest</th>
              <th className={admin.th}>Property</th>
              <th className={admin.th}>Check-in</th>
              <th className={admin.th}>Check-out</th>
              <th className={admin.th}>Nights</th>
              <th className={admin.th}>Channel</th>
              <th className={admin.th}>Status</th>
              <th className={`${admin.th} text-right`}>Total</th>
              <th className={`${admin.th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className={admin.tbody}>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className={admin.tr}>
                <td className={`${admin.td} font-mono text-xs font-medium text-slate-900`}>
                  {booking.booking_reference}
                </td>
                <td className={`${admin.td} font-medium text-slate-900`}>{booking.guest?.name || 'N/A'}</td>
                <td className={admin.td}>{booking.apartment?.apartment_number || 'N/A'}</td>
                <td className={admin.td}>{formatDate(booking.check_in_date)}</td>
                <td className={admin.td}>{formatDate(booking.check_out_date)}</td>
                <td className={admin.td}>{booking.nights}</td>
                <td className={admin.td}>{booking.channel?.name || 'N/A'}</td>
                <td className={admin.td}>
                  <span className={statusBadge(booking.booking_status)}>{booking.booking_status}</span>
                </td>
                <td className={`${admin.td} text-right font-semibold text-slate-900`}>
                  {formatCurrency(booking.total_payout || 0)}
                </td>
                <td className={admin.td}>{renderBookingActions(booking)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && emptyState}
      </div>

      {showDetailsModal && selectedBooking && (
        <div className={admin.modalOverlayScroll} role="dialog" aria-modal="true">
          <div className="min-h-full flex items-end sm:items-start justify-center py-4 sm:py-8">
            <div className={`${admin.modalPanel} w-full max-w-3xl flex flex-col max-h-[min(90vh,calc(100dvh-2rem))] sm:max-h-[90vh]`}>
              <div className={`${admin.modalHeader} shrink-0 px-4 sm:px-6 py-4`}>
                <div className="min-w-0 pr-3">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">Booking Details</h3>
                  <p className="text-sm text-slate-500 font-mono truncate">{selectedBooking.booking_reference}</p>
                </div>
                <button type="button" onClick={() => setShowDetailsModal(false)} className={`${admin.btnIcon} text-slate-500 hover:bg-slate-100`} aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto overscroll-contain flex-1 px-4 sm:px-6 pb-6 pt-4 space-y-4">
                <span className={statusBadge(selectedBooking.booking_status)}>{selectedBooking.booking_status}</span>
                <section className={`${admin.cardMuted} p-4`}>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-violet-600" /> Guest
                  </h4>
                  <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div><dt className="text-slate-500">Name</dt><dd className="text-slate-900 font-medium">{selectedBooking.guest?.name || 'N/A'}</dd></div>
                    <div><dt className="text-slate-500">Email</dt><dd className="text-slate-900 break-all">{selectedBooking.guest?.email || 'N/A'}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-slate-500">Phone</dt><dd className="text-slate-900">{selectedBooking.guest?.phone || 'N/A'}</dd></div>
                  </dl>
                </section>
                <section className={`${admin.cardMuted} p-4`}>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Home className="w-5 h-5 text-right-stay-600" /> Property
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div><dt className="text-slate-500">Property</dt><dd className="text-slate-900 font-medium">{selectedBooking.apartment?.apartment_number || 'N/A'}</dd></div>
                    <div><dt className="text-slate-500">Address</dt><dd className="text-slate-900">{selectedBooking.apartment?.address || 'N/A'}</dd></div>
                  </dl>
                </section>
                <section className={`${admin.cardMuted} p-4`}>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" /> Stay
                  </h4>
                  <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div><dt className="text-slate-500">Check-in</dt><dd className="text-slate-900 font-medium">{formatDate(selectedBooking.check_in_date)}</dd></div>
                    <div><dt className="text-slate-500">Check-out</dt><dd className="text-slate-900 font-medium">{formatDate(selectedBooking.check_out_date)}</dd></div>
                    <div><dt className="text-slate-500">Nights</dt><dd className="text-slate-900 font-medium">{selectedBooking.nights}</dd></div>
                    <div><dt className="text-slate-500">Channel</dt><dd className="text-slate-900 font-medium">{selectedBooking.channel?.name || 'N/A'}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-slate-500">Booking date</dt><dd className="text-slate-900">{formatDate(selectedBooking.booking_date)}</dd></div>
                  </dl>
                </section>
                <section className={`${admin.cardMuted} p-4`}>
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-600" /> Financial
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Accommodation</dt><dd className="text-slate-900 font-medium">{formatCurrency(selectedBooking.accommodation_total)}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Cleaning fee</dt><dd className="text-slate-900 font-medium">{formatCurrency(selectedBooking.cleaning_fee || 0)}</dd></div>
                    <div className="flex justify-between gap-4 border-t border-slate-200 pt-2"><dt className="text-slate-900 font-semibold">Total payout</dt><dd className="text-right-stay-600 font-bold text-lg">{formatCurrency(selectedBooking.total_payout || 0)}</dd></div>
                  </dl>
                </section>
                {selectedBooking.notes && (
                  <section className={`${admin.cardMuted} p-4`}>
                    <h4 className="text-base font-semibold text-slate-900 mb-2">Notes</h4>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap">{selectedBooking.notes}</p>
                  </section>
                )}
                {selectedBooking.payment_status && (
                  <section className={`${admin.cardMuted} p-4`}>
                    <h4 className="text-base font-semibold text-slate-900 mb-3">Payment</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between items-center gap-4">
                        <dt className="text-slate-500">Status</dt>
                        <dd><span className={paymentBadge(selectedBooking.payment_status)}>{selectedBooking.payment_status}</span></dd>
                      </div>
                      {selectedBooking.payment_date && <div className="flex justify-between gap-4"><dt className="text-slate-500">Date</dt><dd className="text-slate-900">{formatDate(selectedBooking.payment_date)}</dd></div>}
                      {selectedBooking.payment_method && <div className="flex justify-between gap-4"><dt className="text-slate-500">Method</dt><dd className="text-slate-900">{selectedBooking.payment_method}</dd></div>}
                      {selectedBooking.payment_notes && <div><dt className="text-slate-500">Notes</dt><dd className="text-slate-700 mt-1 whitespace-pre-wrap">{selectedBooking.payment_notes}</dd></div>}
                    </dl>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedBooking && (
        <div className={admin.modalOverlayScroll} role="dialog" aria-modal="true">
          <div className="min-h-full flex items-end sm:items-start justify-center py-4 sm:py-8">
            <div className={`${admin.modalPanel} w-full max-w-2xl flex flex-col max-h-[min(90vh,calc(100dvh-2rem))] sm:max-h-[90vh]`}>
              <div className={`${admin.modalHeader} shrink-0 px-4 sm:px-6 py-4`}>
                <div className="min-w-0 pr-3">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">Update booking</h3>
                  <p className="text-sm text-slate-500 font-mono truncate">{selectedBooking.booking_reference}</p>
                </div>
                <button type="button" onClick={() => setShowEditModal(false)} className={`${admin.btnIcon} text-slate-500 hover:bg-slate-100`} aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateBooking} className="overflow-y-auto overscroll-contain flex-1 px-4 sm:px-6 pb-6 pt-4 space-y-4">
                <div>
                  <label className={admin.label}>Booking status</label>
                  <select value={editFormData.booking_status} onChange={(e) => setEditFormData((prev) => ({ ...prev, booking_status: e.target.value }))} className={admin.select}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className={admin.label}>Payment status <span className="text-red-500">*</span></label>
                  <select value={editFormData.payment_status} onChange={(e) => setEditFormData((prev) => ({ ...prev, payment_status: e.target.value }))} required className={admin.select}>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <p className={`${admin.hint} mt-1.5`}>Bookings can only be confirmed when payment status is Paid.</p>
                </div>
                <div>
                  <label className={admin.label}>Payment date</label>
                  <input type="date" value={editFormData.payment_date} onChange={(e) => setEditFormData((prev) => ({ ...prev, payment_date: e.target.value }))} className={admin.input} />
                </div>
                <div>
                  <label className={admin.label}>Payment method</label>
                  <select value={editFormData.payment_method} onChange={(e) => setEditFormData((prev) => ({ ...prev, payment_method: e.target.value }))} className={admin.select}>
                    <option value="">Select method…</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={admin.label}>Payment notes</label>
                  <textarea value={editFormData.payment_notes} onChange={(e) => setEditFormData((prev) => ({ ...prev, payment_notes: e.target.value }))} rows={3} className={admin.textarea} placeholder="Payment-related notes…" />
                </div>
                {editFormData.booking_status === 'confirmed' && editFormData.payment_status !== 'paid' && (
                  <div className={`${admin.alertError} items-start`}>
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Cannot confirm without payment</p>
                      <p className="text-sm opacity-90 mt-1">Set payment status to Paid before confirming.</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className={admin.btnGhost}>Cancel</button>
                  <button type="submit" className={admin.btnPrimary}>
                    <CheckCircle className="w-5 h-5" />
                    Update booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
