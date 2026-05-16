"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

function normalizeDateKey(value: string): string {
  return value.slice(0, 10);
}

interface AvailabilityCalendarProps {
  propertyId: string;
  onDateSelect: (checkIn: string | null, checkOut: string | null) => void;
  selectedCheckIn: string | null;
  selectedCheckOut: string | null;
  onCalendarDataChange?: (data: {
    dailyPrices: Record<string, number>;
    blockedDates: string[];
    pricing: {
      pricingEnabled: boolean;
      minPrice: number | null;
      basePrice: number | null;
      maxPrice: number | null;
    };
  }) => void;
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
  onCalendarDataChange,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [dailyPrices, setDailyPrices] = useState<Record<string, number>>({});
  const [pricingMeta, setPricingMeta] = useState<{
    pricingEnabled: boolean;
    minPrice: number | null;
    basePrice: number | null;
    maxPrice: number | null;
  }>({
    pricingEnabled: false,
    minPrice: null,
    basePrice: null,
    maxPrice: null,
  });
  const [loading, setLoading] = useState(true);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);
  const onCalendarDataChangeRef = useRef(onCalendarDataChange);
  onCalendarDataChangeRef.current = onCalendarDataChange;

  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch blocked dates for a wider range (6 months) to support navigation
  useEffect(() => {
    const abortController = new AbortController();

    async function fetchAvailability() {
      setLoading(true);
      try {
        // 1 month before viewed month through end of month 6 months ahead
        const rangeStart = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - 1,
          1
        );
        const rangeEndInclusive = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 7,
          0
        );
        // Exclusive end (day after last included day) — avoids stale cache on 10-31 URLs
        const rangeEndExclusive = new Date(rangeEndInclusive);
        rangeEndExclusive.setDate(rangeEndExclusive.getDate() + 1);

        const startParam = formatDateLocal(rangeStart);
        const endParam = formatDateLocal(rangeEndExclusive);

        const response = await fetch(
          `/api/get-blocked-dates?propertyId=${encodeURIComponent(propertyId)}&startDate=${startParam}&endDate=${endParam}`,
          { cache: 'no-store', signal: abortController.signal }
        );

        if (response.ok) {
          const data = await response.json();
          const blockedDateList = (data.blockedDates || [])
            .map((d: BlockedDate | string) =>
              typeof d === 'string' ? normalizeDateKey(d) : normalizeDateKey(d.date || '')
            )
            .filter(Boolean);
          const blocked = new Set<string>(blockedDateList);
          setBlockedDates(blocked);
          setDailyPrices(data.dailyPrices || {});
          const pricing =
            data.pricing || {
              pricingEnabled: false,
              minPrice: null,
              basePrice: null,
              maxPrice: null,
            };
          setPricingMeta(pricing);
          onCalendarDataChangeRef.current?.({
            dailyPrices: data.dailyPrices || {},
            blockedDates: blockedDateList,
            pricing,
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Error fetching availability:', error);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchAvailability();
    return () => abortController.abort();
  }, [propertyId, currentMonth]);

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => formatDateLocal(date);

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
          const blockedDatesInRange: string[] = [];
          for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
            if (isDateBlocked(d)) {
              blockedDatesInRange.push(formatDate(d));
            }
          }
          alert(`The selected range contains unavailable dates:\n${blockedDatesInRange.slice(0, 5).join(', ')}${blockedDatesInRange.length > 5 ? '...' : ''}\n\nPlease select a different range.`);
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
      days.push(<div key={`empty-${i}`} className="h-16 md:h-20"></div>);
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

      const dayPrice = dailyPrices[dateStr];
      const fallbackPrice =
        pricingMeta.basePrice != null
          ? pricingMeta.basePrice
          : pricingMeta.minPrice != null
          ? pricingMeta.minPrice
          : 1500;
      const displayPrice = dayPrice ?? fallbackPrice;

      let className =
        "h-16 md:h-20 flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all text-sm font-medium relative px-1 ";

      if (isCheckIn || isCheckOut) {
        className += "bg-gray-900 text-white shadow-md hover:bg-black font-semibold ";
        if (isCheckIn) className += "rounded-r-none ";
        if (isCheckOut) className += "rounded-l-none ";
      } else if (isInRange) {
        className += "bg-gray-100 text-gray-900 hover:bg-gray-200 ";
      } else if (isBlocked) {
        className += "bg-gray-100 cursor-not-allowed ";
      } else if (isPast) {
        className += "bg-gray-50 text-gray-300 cursor-not-allowed ";
      } else {
        className += "hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-sm ";
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
          <span
            className={`relative inline-flex items-center justify-center text-sm md:text-base font-semibold leading-tight ${
              isBlocked ? 'text-gray-400' : isPast ? 'text-gray-300' : ''
            }`}
          >
            {day}
            {isBlocked && (
              <span
                className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-[1.25em] -translate-x-1/2 -translate-y-1/2 border-t border-gray-400"
                aria-hidden
              />
            )}
          </span>
          {!isBlocked && !isPast && (
            <span
              className={`text-[10px] md:text-xs leading-tight ${
                isCheckIn || isCheckOut ? 'text-white/90' : 'text-gray-600'
              }`}
            >
              <span className="whitespace-nowrap">
                {`R${Math.round(displayPrice).toLocaleString('en-ZA')}`}
              </span>
            </span>
          )}
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
    <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={previousMonth}
          disabled={!canGoPrevious() || loading}
          className="p-2 md:p-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center justify-center"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
        </button>
        
        <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 px-4">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          type="button"
          onClick={nextMonth}
          disabled={loading}
          className="p-2 md:p-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center justify-center"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
        </button>
      </div>

      {/* Selection Instructions */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-800">
          {!selectedCheckIn ? (
            "Select check-in date"
          ) : !selectedCheckOut ? (
            "Select check-out date"
          ) : (
            `Selected: ${new Date(selectedCheckIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(selectedCheckOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
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
      <div className="mt-5 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-900 rounded"></div>
            <span className="text-gray-700">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span className="text-gray-700">In range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400">
              <span>0</span>
              <span
                className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-3 -translate-x-1/2 -translate-y-1/2 border-t border-gray-400"
                aria-hidden
              />
            </div>
            <span className="text-gray-700">Unavailable</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span>Daily prices from PriceLabs sync</span>
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

