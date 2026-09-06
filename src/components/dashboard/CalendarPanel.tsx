import { useMemo, useState } from 'react';
import clsx from 'clsx';
import Card from '../ui/Card';
import type { CalendarEvent } from '../../types';
import { formatDate, formatMonthYear, toISODate } from '../../lib/format';
import { REVIEW_TYPE_META } from '../../lib/constants';

interface CalendarPanelProps {
  events: CalendarEvent[];
  pomodoroHistory: Record<string, number>;
  todayCount: number;
  currentDate: string;
}

const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六'];

const CalendarPanel = ({ events, pomodoroHistory, todayCount, currentDate }: CalendarPanelProps) => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = currentDate ? new Date(currentDate) : new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => currentDate);
  const [showModal, setShowModal] = useState(false);

  const eventsByDate = useMemo<Record<string, CalendarEvent[]>>(() => {
    const map: Record<string, CalendarEvent[]> = {};
    const pushEvent = (event: CalendarEvent) => {
      if (!map[event.date]) map[event.date] = [];
      if (!map[event.date].some((item) => item.id === event.id)) {
        map[event.date].push(event);
      }
    };

    events.forEach(pushEvent);

    const history = { ...pomodoroHistory };
    if (todayCount > 0) {
      history[currentDate] = todayCount;
    }

    Object.entries(history).forEach(([date, count]) => {
      pushEvent({
        id: `pomodoro-${date}`,
        date,
        title: `番茄 ${count} 顆`,
        type: 'pomodoro',
      });
    });

    return map;
  }, [events, pomodoroHistory, todayCount, currentDate]);

  const calendarDays = useMemo(() => {
    const start = new Date(visibleMonth);
    const startDay = start.getDay();
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - startDay);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];

  const goToMonth = (offset: number) => {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const todayISO = toISODate(new Date());

  return (
    <Card className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">AI Calendar</p>
          <h3 className="text-2xl font-semibold text-text-dark">{formatMonthYear(visibleMonth)}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="glass-pill text-xs"
            onClick={() => {
              const today = new Date();
              setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              setSelectedDate(toISODate(today));
            }}
          >
            今天
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-white/40 bg-white/30 px-3 py-2"
              onClick={() => goToMonth(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="rounded-full border border-white/40 bg-white/30 px-3 py-2"
              onClick={() => goToMonth(1)}
            >
              →
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-2">
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500">
          {weekdayLabels.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date) => {
            const dateKey = toISODate(date);
            const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
            const isToday = dateKey === todayISO;
            const getEventStyle = (type: CalendarEvent['type'], taskType?: CalendarEvent['taskType']) => {
              if (type === 'pomodoro') return 'bg-rose-100 text-rose-700 border-rose-200';
              if (type === 'study-plan') return 'bg-purple-100 text-purple-700 border-purple-200';

              // Task styles
              switch (taskType) {
                case 'exam-sprint':
                  return 'bg-amber-100 text-amber-700 border-amber-200';
                case 'submit-assignment':
                  return 'bg-red-100 text-red-700 border-red-200';
                default:
                  return 'bg-blue-100 text-blue-700 border-blue-200';
              }
            };
            const dayEvents = eventsByDate[dateKey] ?? [];
            return (
              <button
                type="button"
                key={dateKey}
                onClick={() => {
                  setSelectedDate(dateKey);
                  setShowModal(true);
                }}
                className={clsx(
                  'flex flex-col rounded-2xl border px-1 py-1 sm:px-2 sm:py-2 text-left transition hover:-translate-y-0.5 relative overflow-hidden',
                  'aspect-square sm:aspect-auto sm:min-h-[90px]', // Mobile: square, Desktop: min-height
                  dateKey === selectedDate
                    ? 'border-secondary/70 bg-white/80 shadow-glow'
                    : 'border-white/40 bg-white/50',
                  !isCurrentMonth && 'opacity-50',
                )}
              >
                <div className="flex items-center justify-between text-sm font-semibold text-text-dark w-full">
                  <span className={clsx(isToday && "text-secondary font-bold")}>{date.getDate()}</span>
                  {isToday && <span className="h-1.5 w-1.5 rounded-full bg-secondary block sm:hidden"></span>}
                  {isToday && <span className="text-xs text-secondary hidden sm:block">今天</span>}
                </div>
                <div className="mt-1 flex-1 flex flex-col justify-end space-y-1 text-xs">
                  {dayEvents.length > 0 && (
                    <>
                      {/* Mobile: Simple Dot Indicator */}
                      <div className="block sm:hidden absolute bottom-1 right-1">
                        <div className={clsx(
                          "h-2 w-2 rounded-full",
                          dayEvents[0].type === 'pomodoro' ? "bg-rose-400" : "bg-primary-400"
                        )} />
                      </div>

                      {/* Desktop: Full Event Pills */}
                      <div className="hidden sm:block w-full">
                        <div
                          className={clsx(
                            'rounded-full px-2 py-1 text-[0.65rem] font-semibold border truncate w-full',
                            getEventStyle(dayEvents[0].type, dayEvents[0].taskType)
                          )}
                        >
                          {dayEvents[0].type === 'pomodoro' ? `🍅 ${dayEvents[0].title.replace('番茄 ', '')}` : dayEvents[0].title}
                        </div>
                        {dayEvents.length > 1 && (
                          <p className="text-[0.65rem] text-gray-500 text-center">+{dayEvents.length - 1}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {showModal && selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/90 p-6 shadow-soft backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">選擇日期</p>
                <h4 className="text-xl font-semibold text-text-dark">{formatDate(selectedDate)}</h4>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/50 px-3 py-1 text-sm text-gray-500"
                onClick={() => setShowModal(false)}
              >
                關閉
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {selectedEvents.length === 0 && (
                <p className="text-sm text-gray-600">這一天暫無排程，安排一下新的任務吧！</p>
              )}
              {selectedEvents.map((event) => {
                const meta = event.taskType ? REVIEW_TYPE_META[event.taskType] : undefined;
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-2xl border border-white/40 bg-white px-3 py-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{event.type === 'pomodoro' ? '🍅' : '📌'}</span>
                        <p className="text-sm font-semibold text-text-dark">{event.title}</p>
                      </div>
                      {meta && (
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-[0.65rem] font-semibold ${meta.colorClass}`}
                        >
                          {meta.label}
                        </span>
                      )}
                    </div>
                    {event.type === 'task' && (
                      <span className="text-xs text-gray-500">
                        {event.status === 'done' ? '完成' : '進行中'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CalendarPanel;
