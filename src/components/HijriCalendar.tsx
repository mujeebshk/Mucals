import { useEffect, useMemo, useState } from "react";

type LocationState = {
  loading: boolean;
  message: string;
  latitude?: number;
  longitude?: number;
};

type HijriDate = {
  day: string;
  month: {
    number: number;
    en: string;
  };
  holidays: string[];
  year: string;
};

type Props = {
  location: LocationState;
  showCalendarView: boolean;
  setShowCalendarView: (value: boolean) => void;
};

function HijriCalendar({
  location,
  showCalendarView,
  setShowCalendarView,
}: Props) {
  const [currentHijri, setCurrentHijri] = useState<HijriDate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [hijriDatesCache, setHijriDatesCache] = useState<
    Map<string, HijriDate>
  >(new Map());

  useEffect(() => {
    const fetchHijriDate = async () => {
      setLoading(true);
      setError(null);

      try {
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;

        // Use the date-specific endpoint which doesn't require location coordinates
        const response = await fetch(
          `https://api.aladhan.com/v1/gToH/${dateStr}?adjustment=${import.meta.env.VITE_HIJRI_ADJUSTMENT || 0}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Hijri date");
        }

        const data = await response.json();
        const hijriData = data.data.hijri;
        setCurrentHijri(hijriData);

        // Seed the cache with today's date immediately to prevent "..." in history
        setHijriDatesCache((prev) => {
          const newCache = new Map(prev);
          const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
          newCache.set(dateKey, hijriData);
          return newCache;
        });
      } catch (err) {
        setError("Unable to fetch Hijri date");
        console.error("Hijri date fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHijriDate();
  }, []);

  const [holidays, setHolidays] = useState<{ [key: string]: string[] }>({});

  const fetchHolidays = async () => {
    try {
      // Fetch holidays from API
      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${viewYear}/IN`,
      );
      if (response.ok && response.status !== 204) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : [];
        const holidayMap: { [key: string]: string[] } = {};
        if (Array.isArray(data)) {
          data.forEach((holiday: any) => {
            const date = new Date(holiday.date);
            const key = `${date.getMonth() + 1}-${date.getDate()}`;
            if (!holidayMap[key]) holidayMap[key] = [];
            holidayMap[key].push(holiday.localName);
          });
          setHolidays(holidayMap);
        }
      } else {
        setHolidays({});
      }
    } catch (err) {
      console.error("Error fetching holidays:", err);
      setHolidays({});
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [viewYear]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const fetchHijriForMonth = async (month: number, year: number) => {
    try {
      // Use gToHCalendar to convert the whole Gregorian month without requiring location
      const response = await fetch(
        `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}?adjustment=${import.meta.env.VITE_HIJRI_ADJUSTMENT || 0}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch monthly Hijri calendar");
      }

      const result = await response.json();
      const monthData = result.data || {};

      // gToHCalendar returns a keyed object (e.g., {"1": {...}, "2": {...}}).
      // We convert it to an array so we can iterate over it.
      const dataArray = Array.isArray(monthData)
        ? monthData
        : Object.values(monthData);

      setHijriDatesCache((prev) => {
        const newCache = new Map(prev);
        dataArray.forEach((dayEntry: any) => {
          if (!dayEntry?.gregorian?.date) return;
          // API returns DD-MM-YYYY, we convert to YYYY-MM-DD for easier keys
          const [d, m, y] = dayEntry.gregorian.date.split("-");
          const dateStr = `${y}-${m}-${d}`;
          newCache.set(dateStr, dayEntry.hijri);
        });
        return newCache;
      });
    } catch (err) {
      console.error("Error fetching Hijri month data:", err);
    }
  };

  // Effect to handle history and current month synchronization
  useEffect(() => {
    const now = new Date();
    fetchHijriForMonth(now.getMonth() + 1, now.getFullYear());

    // If early in the month, fetch previous month for the 7-day history
    if (now.getDate() < 8) {
      const prev = new Date();
      prev.setMonth(now.getMonth() - 1);
      fetchHijriForMonth(prev.getMonth() + 1, prev.getFullYear());
    }
  }, []);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [viewYear, viewMonth]);

  // Load Hijri dates for the selected month using the calendar API
  useEffect(() => {
    if (!showCalendarView) return;

    fetchHijriForMonth(viewMonth + 1, viewYear);
  }, [showCalendarView, viewYear, viewMonth]);

  const history = useMemo(() => {
    if (!currentHijri) return [];

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const hijri = hijriDatesCache.get(dateKey);

      return {
        dateLabel: date.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        hijriLabel: hijri ? `${hijri.day} ${hijri.month.en}` : "...",
      };
    });
  }, [currentHijri, hijriDatesCache]);

  const monthNames = [
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

  const handlePrevMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const getHijriDate = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return hijriDatesCache.get(dateStr);
  };

  const getHolidaysForDate = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    const month = date.getMonth() + 1;
    const dayOfMonth = date.getDate();
    const key = `${month}-${dayOfMonth}`;
    return holidays[key] || [];
  };

  if (loading) {
    return (
      <div className="hijri-grid">
        <div className="hijri-entry">
          <span>Loading Hijri date...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hijri-grid">
        <div className="hijri-entry">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="hijri-calendar-container">
      {showCalendarView ? (
        <div className="calendar-view">
          <div className="calendar-header">
            <button
              type="button"
              className="month-nav-btn"
              onClick={handlePrevMonth}
            >
              ←
            </button>
            <div className="month-info">
              <h4 className="gregorian-month">
                {monthNames[viewMonth]} {viewYear}
              </h4>
              <h5 className="hijri-month">
                {(() => {
                  const firstDayHijri = getHijriDate(1);
                  const lastDay = getDaysInMonth(viewYear, viewMonth);
                  const lastDayHijri = getHijriDate(lastDay);
                  if (!firstDayHijri || !lastDayHijri) return "...";
                  if (
                    firstDayHijri.month.number === lastDayHijri.month.number
                  ) {
                    return `${firstDayHijri.month.en} ${firstDayHijri.year}`;
                  } else {
                    return `${firstDayHijri.month.en} - ${lastDayHijri.month.en} ${firstDayHijri.year}`;
                  }
                })()}
              </h5>
            </div>
            <button
              type="button"
              className="month-nav-btn"
              onClick={handleNextMonth}
            >
              →
            </button>
          </div>

          <div className="month-calendar">
            <div className="weekdays">
              <div className="weekday">Sun</div>
              <div className="weekday">Mon</div>
              <div className="weekday">Tue</div>
              <div className="weekday">Wed</div>
              <div className="weekday">Thu</div>
              <div className="weekday">Fri</div>
              <div className="weekday">Sat</div>
            </div>

            <div className="calendar-dates">
              {calendarDays.map((day, idx) => {
                const hijri = day ? getHijriDate(day) : null;
                const gregorianHolidays = day ? getHolidaysForDate(day) : [];
                const hasEvents =
                  day !== null &&
                  ((hijri?.holidays?.length ?? 0) > 0 ||
                    gregorianHolidays.length > 0);
                const isToday =
                  day !== null &&
                  day === new Date().getDate() &&
                  viewMonth === new Date().getMonth() &&
                  viewYear === new Date().getFullYear();
                const isSelected = day !== null && day === selectedDay;

                return (
                  <div
                    key={`date-${idx}`}
                    className={`date-cell ${day === null ? "empty" : ""} ${isToday ? "today" : ""} ${hasEvents ? "has-event" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => day !== null && setSelectedDay(day)}
                  >
                    {day && (
                      <>
                        <span className="gregorian-date">{day}</span>
                        {hijri && (
                          <span className="hijri-date">{hijri.day}</span>
                        )}
                        <div
                          className={`event-indicator ${hasEvents ? "visible" : ""} ${isSelected ? "active" : ""}`}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDay && (
            <div className="calendar-event-details">
              <div className="details-header">
                <span>
                  {selectedDay} {monthNames[viewMonth]} {viewYear}{" "}
                </span>
                {getHijriDate(selectedDay) && (
                  <span className="details-hijri">
                    ({getHijriDate(selectedDay)?.day}{" "}
                    {getHijriDate(selectedDay)?.month.en})
                  </span>
                )}
              </div>
              <div className="details-content">
                {(getHijriDate(selectedDay)?.holidays?.length ?? 0) === 0 &&
                getHolidaysForDate(selectedDay).length === 0 ? (
                  <p className="no-events">No specific events for this day.</p>
                ) : (
                  <>
                    {getHijriDate(selectedDay)?.holidays?.map((h, i) => (
                      <div key={`detail-h-${i}`} className="event-item islamic">
                        <span className="event-icon">🌙</span> {h}
                      </div>
                    ))}
                    {getHolidaysForDate(selectedDay).map((h, i) => (
                      <div
                        key={`detail-g-${i}`}
                        className="event-item gregorian"
                      >
                        <span className="event-icon">📅</span> {h}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="hijri-grid">
          {currentHijri && (
            <div className="hijri-entry current-hijri">
              <span>Today</span>
              <strong>
                {currentHijri.day} {currentHijri.month.en} {currentHijri.year}
              </strong>
            </div>
          )}
          {history.slice(1).map((entry) => (
            <div key={entry.dateLabel} className="hijri-entry">
              <span>{entry.dateLabel}</span>
              <strong>{entry.hijriLabel}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HijriCalendar;
