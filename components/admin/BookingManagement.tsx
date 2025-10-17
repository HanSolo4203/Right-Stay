'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Calendar, User, Home, DollarSign, Filter, ChevronDown, Eye, Search, Edit2, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react';

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
  };
  guest: {
    name: string;
    email: string;
    phone: string;
  };
  channel: {
    name: string;
  };
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
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
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
        b.guest.name.toLowerCase().includes(query) ||
        b.apartment.apartment_number.toLowerCase().includes(query) ||
        b.channel.name.toLowerCase().includes(query)
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

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
    if (booking.channel.name !== 'Direct') {
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'partial':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'pending':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'refunded':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Booking Management</h2>
        <p className="text-gray-400">View and manage all property bookings</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference, guest, property, or channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Total Bookings</p>
          <p className="text-2xl font-bold text-white">{bookings.length}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-green-400">
            {bookings.filter(b => b.booking_status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">
            {bookings.filter(b => b.booking_status === 'pending').length}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-400">
            {formatCurrency(bookings.reduce((sum, b) => sum + (b.total_payout || 0), 0))}
          </p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Check-out
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nights
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {booking.booking_reference}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white">
                        {booking.apartment.apartment_number}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-white">{booking.guest.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white">
                        {formatDate(booking.check_in_date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-white">
                        {formatDate(booking.check_out_date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-white font-medium">
                      {booking.nights}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">
                      {booking.channel.name}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(booking.booking_status)}`}>
                      {booking.booking_status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-white">
                        {formatCurrency(booking.total_payout || 0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(booking)}
                        className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Edit Status"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      {booking.channel.name === 'Direct' && (
                        <button
                          onClick={() => handleDelete(booking)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No bookings found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl border border-white/10 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Booking Details</h3>
                <p className="text-sm text-gray-400">{selectedBooking.booking_reference}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <span className={`px-4 py-2 text-sm font-medium rounded-lg border ${getStatusBadgeColor(selectedBooking.booking_status)}`}>
                  {selectedBooking.booking_status.toUpperCase()}
                </span>
              </div>

              {/* Guest Information */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-400" />
                  Guest Information
                </h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <p className="text-white font-medium">{selectedBooking.guest.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <p className="text-white">{selectedBooking.guest.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <p className="text-white">{selectedBooking.guest.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-blue-400" />
                  Property Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Property:</span>
                    <p className="text-white font-medium">{selectedBooking.apartment.apartment_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Address:</span>
                    <p className="text-white">{selectedBooking.apartment.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-400" />
                  Booking Details
                </h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Check-in:</span>
                    <p className="text-white font-medium">{formatDate(selectedBooking.check_in_date)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Check-out:</span>
                    <p className="text-white font-medium">{formatDate(selectedBooking.check_out_date)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Nights:</span>
                    <p className="text-white font-medium">{selectedBooking.nights}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Channel:</span>
                    <p className="text-white font-medium">{selectedBooking.channel.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Booking Date:</span>
                    <p className="text-white">{formatDate(selectedBooking.booking_date)}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                  Financial Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accommodation:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedBooking.accommodation_total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cleaning Fee:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedBooking.cleaning_fee || 0)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                    <span className="text-white font-semibold">Total Payout:</span>
                    <span className="text-white font-bold text-lg">{formatCurrency(selectedBooking.total_payout || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Notes</h4>
                  <p className="text-gray-300 text-sm">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Payment Information */}
              {selectedBooking.payment_status && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Payment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Payment Status:</span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPaymentStatusColor(selectedBooking.payment_status)}`}>
                        {selectedBooking.payment_status}
                      </span>
                    </div>
                    {selectedBooking.payment_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Payment Date:</span>
                        <span className="text-white">{formatDate(selectedBooking.payment_date)}</span>
                      </div>
                    )}
                    {selectedBooking.payment_method && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Payment Method:</span>
                        <span className="text-white">{selectedBooking.payment_method}</span>
                      </div>
                    )}
                    {selectedBooking.payment_notes && (
                      <div>
                        <span className="text-gray-400">Payment Notes:</span>
                        <p className="text-white mt-1">{selectedBooking.payment_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Update Booking Status</h3>
                <p className="text-sm text-gray-400">{selectedBooking.booking_reference}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateBooking} className="p-6 space-y-4">
              {/* Booking Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Booking Status
                </label>
                <select
                  value={editFormData.booking_status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, booking_status: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Status *
                </label>
                <select
                  value={editFormData.payment_status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, payment_status: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Booking can only be confirmed if payment status is &quot;Paid&quot;
                </p>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={editFormData.payment_date}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={editFormData.payment_method}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select method...</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Payment Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Notes
                </label>
                <textarea
                  value={editFormData.payment_notes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, payment_notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Add any payment-related notes..."
                />
              </div>

              {/* Warning if trying to confirm without payment */}
              {editFormData.booking_status === 'confirmed' && editFormData.payment_status !== 'paid' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 text-sm font-medium">Cannot confirm without payment</p>
                    <p className="text-red-300 text-xs mt-1">
                      Please set payment status to &quot;Paid&quot; before confirming the booking.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Update Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

