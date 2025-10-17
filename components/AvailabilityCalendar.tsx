"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface AvailabilityCalendarProps {
  propertyId: string;
  onDateSelect: (checkIn: string | null, checkOut: string | null) => void;
  selectedCheckIn: string | null;
  selectedCheckOut: string | null;
}

interface BlockedDate {
  date: string;
  available: boolean;
  blocked_reason?: string;
}

export default function AvailabilityCalendar({
  propertyId,
  onDateSelect,
  selectedCheckIn,
  selectedCheckOut,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  // Fetch blocked dates for the current month and next 3 months
  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      try {
        // Get date range for current month through 3 months ahead
        const startDate = new Date(currentMonth);
        startDate.setDate(1);
        
        const endDate = new Date(currentMonth);
        endDate.setMonth(endDate.getMonth() + 3);
        endDate.setDate(0); // Last day of the month
        
        const response = await fetch(
          `/api/get-blocked-dates?propertyId=${propertyId}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const blocked = new Set<string>(data.blockedDates.map((d: BlockedDate) => d.date));
          setBlockedDates(blocked);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [propertyId, currentMonth]);

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.has(formatDate(date));
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    const checkIn = new Date(selectedCheckIn);
    const checkOut = new Date(selectedCheckOut);
    return date > checkIn && date < checkOut;
  };

  const isDateSelectable = (date: Date) => {
    return !isDateBlocked(date) && !isDatePast(date);
  };

  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;

    const dateStr = formatDate(date);

    if (!selectingCheckOut) {
      // Selecting check-in date
      onDateSelect(dateStr, null);
      setSelectingCheckOut(true);
    } else {
      // Selecting check-out date
      if (selectedCheckIn && new Date(dateStr) <= new Date(selectedCheckIn)) {
        // If selected date is before or same as check-in, restart selection
        onDateSelect(dateStr, null);
        setSelectingCheckOut(true);
      } else if (selectedCheckIn) {
        // Check if there are any blocked dates in the range
        const checkIn = new Date(selectedCheckIn);
        const checkOut = new Date(dateStr);
        let hasBlockedInRange = false;
        
        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          if (isDateBlocked(d)) {
            hasBlockedInRange = true;
            break;
          }
        }

        if (hasBlockedInRange) {
          // Restart selection if there's a blocked date in range
          alert('The selected range contains unavailable dates. Please select a different range.');
          onDateSelect(dateStr, null);
          setSelectingCheckOut(true);
        } else {
          onDateSelect(selectedCheckIn, dateStr);
          setSelectingCheckOut(false);
        }
      }
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const canGoPrevious = () => {
    const today = new Date();
    const firstOfCurrentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstOfCurrentMonth > firstOfThisMonth;
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 md:h-14"></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
      const dateStr = formatDate(date);
      const isBlocked = isDateBlocked(date);
      const isPast = isDatePast(date);
      const isCheckIn = dateStr === selectedCheckIn;
      const isCheckOut = dateStr === selectedCheckOut;
      const isInRange = isDateInRange(date);
      const isSelectable = isDateSelectable(date);

      let className = "h-12 md:h-14 flex items-center justify-center rounded-lg cursor-pointer transition-all text-sm md:text-base font-medium ";

      if (isCheckIn || isCheckOut) {
        className += "bg-blue-600 text-white shadow-md hover:bg-blue-700 ";
      } else if (isInRange) {
        className += "bg-blue-100 text-blue-900 ";
      } else if (!isSelectable) {
        className += "bg-gray-100 text-gray-400 cursor-not-allowed line-through ";
      } else {
        className += "hover:bg-blue-50 text-gray-900 border border-transparent hover:border-blue-200 ";
      }

      days.push(
        <button
          type="button"
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={!isSelectable}
          className={className}
          title={
            isBlocked
              ? "This date is not available"
              : isPast
              ? "Past date"
              : isCheckIn
              ? "Check-in date"
              : isCheckOut
              ? "Check-out date"
              : "Available"
          }
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={previousMonth}
          disabled={!canGoPrevious() || loading}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          type="button"
          onClick={nextMonth}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Selection Instructions */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          {!selectedCheckIn ? (
            "Select your check-in date"
          ) : !selectedCheckOut ? (
            "Now select your check-out date"
          ) : (
            `${selectedCheckIn} to ${selectedCheckOut}`
          )}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Calendar Grid */}
      {!loading && (
        <>
          {/* Week Day Headers */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="h-10 flex items-center justify-center text-xs md:text-sm font-semibold text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {renderCalendar()}
          </div>
        </>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-gray-700">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <span className="text-gray-700">In range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span className="text-gray-700 line-through">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Clear Selection Button */}
      {selectedCheckIn && (
        <button
          type="button"
          onClick={() => {
            onDateSelect(null, null);
            setSelectingCheckOut(false);
          }}
          className="w-full mt-4 py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear Selection
        </button>
      )}
    </div>
  );
}

