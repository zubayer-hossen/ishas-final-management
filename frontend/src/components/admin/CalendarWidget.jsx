import { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toBanglaDigits } from '../../utils/banglaDigits';

const WEEKDAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const MONTHS_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * @param {{ date: string|Date, label: string, type: 'event'|'meeting' }[]} markers
 */
const CalendarWidget = ({ markers = [] }) => {
  const [cursor, setCursor] = useState(new Date());

  const { weeks, monthLabel } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const weekChunks = [];
    for (let i = 0; i < cells.length; i += 7) weekChunks.push(cells.slice(i, i + 7));

    return { weeks: weekChunks, monthLabel: `${MONTHS_BN[month]} ${toBanglaDigits(year)}` };
  }, [cursor]);

  const markersFor = (day) => {
    if (!day) return [];
    return markers.filter((m) => sameDay(new Date(m.date), day));
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500"
          aria-label="আগের মাস"
        >
          <FiChevronLeft size={16} />
        </button>
        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{monthLabel}</p>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500"
          aria-label="পরের মাস"
        >
          <FiChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 mb-2">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              const dayMarkers = markersFor(day);
              const isToday = day && sameDay(day, new Date());
              return (
                <div
                  key={di}
                  className={`relative h-10 rounded-lg flex flex-col items-center justify-center text-xs ${
                    day
                      ? isToday
                        ? 'bg-gradient-brand text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      : ''
                  }`}
                  title={dayMarkers.map((m) => m.label).join(', ')}
                >
                  {day && toBanglaDigits(day.getDate())}
                  {dayMarkers.length > 0 && (
                    <span
                      className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                        isToday ? 'bg-white' : 'bg-primary-500'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
