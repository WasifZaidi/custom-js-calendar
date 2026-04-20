import React, { useState, useEffect, useRef, useMemo } from 'react';
import dayjs from 'dayjs';
// --- Icons ---
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
export default function DatePicker({ setImportOpen, importedOpen, date, setDate, disable, disableFrom, err, label = "Select Date" }) {
    // Note: `setImportOpen` and `importedOpen` are used to control the opening
    // and closing of the Data Picker, triggered by custom elements
    // (e.g., buttons, inputs, etc.).


  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState('days');
  const modalRef = useRef(null);

  // Sync internal state when external date changes
  useEffect(() => {
    if (date) setViewDate(dayjs(date));
  }, [date]);

  // Handle outside clicks and ESC
  useEffect(() => {
    if (!isOpen && !importedOpen) return;
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
        setImportOpen?.(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, importedOpen]);

  // --- Calculations ---
  const calendarDays = useMemo(() => {
    const startOfMonth = viewDate.startOf('month');
    const startDay = startOfMonth.day();
    const days = [];

    // Fill previous month padding
    const prevMonthDays = startOfMonth.subtract(startDay, 'day');
    for (let i = 0; i < startDay; i++) {
      days.push({ date: prevMonthDays.add(i, 'day'), currentMonth: false });
    }
    // Current month
    for (let i = 1; i <= viewDate.daysInMonth(); i++) {
      days.push({ date: viewDate.date(i), currentMonth: true });
    }
    // Future padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: viewDate.endOf('month').add(i, 'day'), currentMonth: false });
    }
    return days;
  }, [viewDate]);

  const years = useMemo(() => {
    const startYear = Math.floor(viewDate.year() / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  }, [viewDate]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // --- Handlers ---
  const handleDateClick = (d) => {
    setDate(d.format('YYYY-MM-DD'));
  };

  const changeMonth = (offset) => setViewDate(viewDate.add(offset, 'month'));

  return (
    <div className="relative">
      {/* Trigger Button */}
      {
        !importedOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={`flex items-center gap-3 px-4 py-2.5 bg-white border rounded-xl shadow-sm transition-all duration-200 
          ${err ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-200 hover:border-blue-400 focus:ring-4 focus:ring-blue-50'}
          min-w-[220px] group`}
          >
            <span className={`${err ? 'text-red-500' : 'text-gray-400 group-hover:text-blue-500 transition-colors'}`}>
              <Calendar />
            </span>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{label}</span>
              <span className="text-sm font-semibold text-gray-700">
                {date ? dayjs(date).format('MMMM DD, YYYY') : 'Pick a date'}
              </span>
            </div>
          </button>
        )
      }

      {/* Modal Overlay */}
      {(isOpen || importedOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div
            ref={modalRef}
            className="w-full max-w-[340px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          >
            {/* Nav Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <button
                onClick={() => viewMode === 'years' ? setViewDate(viewDate.subtract(12, 'year')) : changeMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <ChevronLeft />
              </button>

              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode(viewMode === "months" ? "days" : "months")}
                  className="flex items-center px-2 py-1 text-sm font-bold text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {viewDate.format("MMMM")}
                  <ChevronDown
                    className={`ml-1 w-4 h-4 transition-transform duration-200 ${viewMode === "months" ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <button
                  onClick={() => setViewMode(viewMode === "years" ? "days" : "years")}
                  className="flex items-center px-2 py-1 text-sm font-bold text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {viewDate.format("YYYY")}
                  <ChevronDown
                    className={`ml-1 w-4 h-4 transition-transform duration-200 ${viewMode === "years" ? "rotate-180" : ""
                      }`}
                  />
                </button>
              </div>

              <button
                onClick={() => viewMode === 'years' ? setViewDate(viewDate.add(12, 'year')) : changeMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <ChevronRight />
              </button>
            </div>

            <div className="p-4 min-h-[280px]">
              {/* Day View */}
              {viewMode === 'days' && (
                <>
                  <div className="grid grid-cols-7 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <span key={i} className="text-center text-[10px] font-bold text-gray-400 uppercase">{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((item, idx) => {
                      const isSelected = date === item.date.format('YYYY-MM-DD');
                      const isToday = item.date.isSame(dayjs(), 'day');

                      const hasValidDisableFrom =
                        disableFrom && dayjs(disableFrom).isValid();

                      // 🔥 Disable past dates
                      const isDisabled =
                        (disable === "past" && item.date.isBefore(dayjs(), "day")) ||

                        (disable === "due" &&
                          hasValidDisableFrom &&
                          (item.date.isSame(dayjs(disableFrom), "day") ||
                            item.date.isBefore(dayjs(disableFrom), "day"))
                        );

                      return (
                        <button
                          key={idx}
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) return;
                            handleDateClick(item.date);
                          }}
                          className={`h-10 w-10 rounded-full text-sm font-medium transition-all
    ${!item.currentMonth ? 'text-gray-200' : ''}
    ${isDisabled ? 'text-gray-200 cursor-not-allowed' : ''}
    ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white' : ''}
    ${isToday && !isSelected && !isDisabled ? 'ring-2 ring-blue-600 ring-inset text-blue-600' : ''}
    ${!isDisabled && !isSelected && !isToday && item.currentMonth ? 'text-gray-600 hover:bg-blue-50 hover:text-blue-600' : ''}
  `}
                        >
                          {item.date.date()}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Month Selector */}
              {viewMode === 'months' && (
                <div className="grid grid-cols-3 gap-2 h-full">
                  {months.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => { setViewDate(viewDate.month(i)); setViewMode('days'); }}
                      className={`py-4 rounded-2xl text-sm font-bold transition-all
                        ${viewDate.month() === i ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}

              {/* Year Selector */}
              {viewMode === 'years' && (
                <div className="grid grid-cols-3 gap-2">
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => { setViewDate(viewDate.year(y)); setViewMode('months'); }}
                      className={`py-4 rounded-2xl text-sm font-bold transition-all
                        ${viewDate.year() === y ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const today = dayjs();
                  setViewDate(today);
                  setDate(today.format('YYYY-MM-DD'));
                  setIsOpen(false);
                  if (typeof setImportOpen === 'function') {
                    setImportOpen(false);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Today
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (typeof setImportOpen === 'function') {
                      setImportOpen(false);
                    } else {
                      setIsOpen(false)
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 rounded-full transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (typeof setImportOpen === 'function') {
                      setImportOpen(false);
                    } else {
                      setIsOpen(false)
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold bg-blue-400 text-white hover:bg-blue-600 rounded-full shadow-sm shadow-gray-200 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
