"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { getTodayISO } from "@/lib/accommodation-search";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const POPOVER_WIDTH_SINGLE = 320;
const POPOVER_WIDTH_DUAL = 624;
const MONTH_GRID_WIDTH = 272;

export { getTodayISO } from "@/lib/accommodation-search";

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function useDualMonthLayout() {
  const [dualMonth, setDualMonth] = useState(false);

  useEffect(() => {
    const update = () => setDualMonth(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return dualMonth;
}

interface GlassSearchDateRangeProps {
  checkIn: string;
  checkOut: string;
  onDatesChange: (checkIn: string, checkOut: string) => void;
  defaultCheckInToday?: boolean;
}

export default function GlassSearchDateRange({
  checkIn: checkInProp,
  checkOut: checkOutProp,
  onDatesChange,
  defaultCheckInToday = true,
}: GlassSearchDateRangeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfDay(new Date()));
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const dualMonth = useDualMonthLayout();

  const [checkIn, setCheckIn] = useState(() => checkInProp || "");
  const [checkOut, setCheckOut] = useState(checkOutProp);

  const today = startOfDay(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!defaultCheckInToday || checkInProp) return;
    const todayIso = getTodayISO();
    setCheckIn(todayIso);
    onDatesChange(todayIso, checkOutProp);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    if (checkInProp) {
      setCheckIn(checkInProp);
      const [y, m] = checkInProp.split("-").map(Number);
      setViewMonth(new Date(y, m - 1, 1));
    }
  }, [checkInProp]);

  useEffect(() => {
    setCheckOut(checkOutProp);
  }, [checkOutProp]);

  const updateDates = useCallback(
    (nextCheckIn: string, nextCheckOut: string) => {
      setCheckIn(nextCheckIn);
      setCheckOut(nextCheckOut);
      onDatesChange(nextCheckIn, nextCheckOut);
    },
    [onDatesChange]
  );

  const positionPopover = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const popoverWidth = dualMonth ? POPOVER_WIDTH_DUAL : POPOVER_WIDTH_SINGLE;
    const viewportPadding = 16;
    const maxLeft = window.innerWidth - popoverWidth - viewportPadding;
    const left = Math.max(
      viewportPadding,
      Math.min(rect.left + rect.width / 2 - popoverWidth / 2, maxLeft)
    );

    setPopoverStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left,
      width: popoverWidth,
      maxWidth: `calc(100vw - ${viewportPadding * 2}px)`,
      zIndex: 9999,
    });
  }, [dualMonth]);

  useEffect(() => {
    if (!open) return;
    positionPopover();
    const onLayout = () => positionPopover();
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [open, positionPopover]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const openPicker = useCallback(
    (forCheckOut: boolean) => {
      if (forCheckOut && !checkIn) return;
      setSelectingCheckOut(forCheckOut);
      setOpen(true);
      positionPopover();
    },
    [checkIn, positionPopover]
  );

  const isDatePast = (date: Date) => date < today;

  const isInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false;
    const iso = formatDateISO(date);
    return iso > checkIn && iso < checkOut;
  };

  const handleDateClick = (date: Date) => {
    if (isDatePast(date)) return;

    const iso = formatDateISO(date);

    if (!selectingCheckOut || !checkIn) {
      updateDates(iso, "");
      setSelectingCheckOut(true);
      return;
    }

    if (iso <= checkIn) {
      updateDates(iso, "");
      setSelectingCheckOut(true);
      return;
    }

    updateDates(checkIn, iso);
    setSelectingCheckOut(false);
    setOpen(false);
  };

  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstWeekday; i++) {
      cells.push(
        <div key={`pad-${year}-${month}-${i}`} className="h-9 w-9 shrink-0" aria-hidden />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const iso = formatDateISO(date);
      const past = isDatePast(date);
      const isCheckIn = iso === checkIn;
      const isCheckOut = iso === checkOut;
      const inRange = isInRange(date);
      const isToday = formatDateISO(today) === iso;

      cells.push(
        <button
          key={`${year}-${month}-${day}`}
          type="button"
          disabled={past}
          onClick={() => handleDateClick(date)}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-medium transition-colors",
            past && "cursor-not-allowed text-white/25",
            !past && !isCheckIn && !isCheckOut && !inRange && "text-white/90 hover:bg-white/15",
            inRange && !isCheckIn && !isCheckOut && "bg-white/15 text-white",
            (isCheckIn || isCheckOut) && "bg-white font-semibold text-gray-900 shadow-sm",
            isToday && !isCheckIn && !isCheckOut && "ring-1 ring-inset ring-white/40"
          )}
        >
          {day}
        </button>
      );
    }

    const trailing = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < trailing; i++) {
      cells.push(
        <div key={`trail-${year}-${month}-${i}`} className="h-9 w-9 shrink-0" aria-hidden />
      );
    }

    return (
      <div className="mx-auto shrink-0" style={{ width: MONTH_GRID_WIDTH }}>
        <p className="mb-3 text-center text-sm font-medium text-white">
          {MONTH_NAMES[month]} {year}
        </p>
        <div className="grid grid-cols-7 gap-1">
          {WEEK_DAYS.map((label) => (
            <div
              key={`${year}-${month}-wd-${label}`}
              className="flex h-8 w-9 items-center justify-center text-xs font-medium text-white/45"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">{cells}</div>
      </div>
    );
  };

  const secondMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    1
  );

  const canGoPrevious =
    new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1) >
    new Date(today.getFullYear(), today.getMonth(), 1);

  const instruction = !checkOut
    ? checkIn
      ? "Select your checkout date"
      : "Select your check-in date"
    : `${formatDisplayDate(checkIn)} – ${formatDisplayDate(checkOut)}`;

  const popover = open && mounted && (
    <div
      ref={popoverRef}
      style={popoverStyle}
      className="box-border overflow-hidden rounded-2xl border border-white/20 bg-gray-950/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-5"
      role="dialog"
      aria-label="Choose dates"
    >
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-white/10 pb-3">
        <p className="text-sm leading-snug text-white/75">{instruction}</p>
        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={() => {
              const resetCheckIn = defaultCheckInToday ? getTodayISO() : "";
              updateDates(resetCheckIn, "");
              setSelectingCheckOut(false);
            }}
            className="shrink-0 text-xs font-medium text-white/60 underline-offset-2 hover:text-white hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="relative mb-3 flex h-10 items-center justify-between px-1">
        <button
          type="button"
          onClick={() =>
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1)
            )
          }
          disabled={!canGoPrevious}
          className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {!dualMonth && (
          <p className="text-sm font-medium text-white/90">
            {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </p>
        )}
        <button
          type="button"
          onClick={() =>
            setViewMonth(
              new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1)
            )
          }
          className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        className={cn(
          "flex justify-center gap-8",
          dualMonth ? "flex-row flex-wrap" : "flex-col"
        )}
      >
        {renderMonth(viewMonth)}
        {dualMonth && renderMonth(secondMonth)}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative min-w-0">
      <div className="grid grid-cols-1 gap-4 min-w-0 md:grid-cols-2">
        <button
          type="button"
          onClick={() => openPicker(false)}
          className={cn(
            "relative flex w-full min-w-0 items-center rounded-2xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-left transition-colors",
            "hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30",
            open && !selectingCheckOut && "ring-2 ring-white/30"
          )}
        >
          <Calendar className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
          <span className="truncate text-white">
            {checkIn ? formatDisplayDate(checkIn) : "Check in date"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => openPicker(true)}
          disabled={!checkIn}
          className={cn(
            "relative flex w-full min-w-0 items-center rounded-2xl border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-left transition-colors",
            "hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            open && selectingCheckOut && "ring-2 ring-white/30"
          )}
        >
          <Calendar
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2",
              checkIn ? "text-white/60" : "text-white/40"
            )}
          />
          <span
            className={cn(
              "truncate",
              checkOut ? "text-white" : "text-white/60"
            )}
          >
            {checkOut ? formatDisplayDate(checkOut) : "Checkout date"}
          </span>
        </button>
      </div>

      {mounted && popover && createPortal(popover, document.body)}
    </div>
  );
}
