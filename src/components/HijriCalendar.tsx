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
  const [hijriDatesCache, setHijriDatesCache] = useState<
    Map<string, HijriDate>
  >(new Map());
  const [cacheUpdate, setCacheUpdate] = useState(0); // Force re-render on cache updates

  useEffect(() => {
    if (!location.latitude || !location.longitude) return;

    const fetchHijriDate = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.aladhan.com/v1/gToH?latitude=${location.latitude}&longitude=${location.longitude}&adjustment=0`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Hijri date");
        }

        const data = await response.json();
        setCurrentHijri(data.data.hijri);
      } catch (err) {
        setError("Unable to fetch Hijri date");
        console.error("Hijri date fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHijriDate();
  }, [location.latitude, location.longitude]);

  const [holidays, setHolidays] = useState<{ [key: string]: string[] }>({});

  const fetchHolidays = async () => {
    try {
      // Fetch holidays from API
      const response = await fetch(
        `https://date.nager.at/api/v2/publicholidays/${viewYear}/IN`,
      );
      if (response.ok) {
        const data = await response.json();
        const holidayMap: { [key: string]: string[] } = {};
        data.forEach((holiday: any) => {
          const date = new Date(holiday.date);
          const key = `${date.getMonth() + 1}-${date.getDate()}`;
          if (!holidayMap[key]) holidayMap[key] = [];
          holidayMap[key].push(holiday.localName);
        });
        setHolidays(holidayMap);
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

  const fetchHijriForMonth = async () => {
    if (!location.latitude || !location.longitude) return;

    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/calendar?latitude=${location.latitude}&longitude=${location.longitude}&method=2&month=${viewMonth + 1}&year=${viewYear}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch monthly Hijri calendar");
      }

      const data = await response.json();
      const monthData = data.data || [];
      const newCache = new Map(hijriDatesCache);

      monthData.forEach((dayEntry: any) => {
        const dayNumber = Number(dayEntry.gregorian.day);
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
        newCache.set(dateStr, dayEntry.hijri);
      });

      setHijriDatesCache(newCache);
      setCacheUpdate((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching Hijri month data:", err);
    }
  };

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
    if (!showCalendarView || !location.latitude || !location.longitude) return;

    fetchHijriForMonth();
  }, [
    showCalendarView,
    viewYear,
    viewMonth,
    location.latitude,
    location.longitude,
  ]);

  const history = useMemo(() => {
    if (!currentHijri) return [];

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);

      const hijriDay = parseInt(currentHijri.day) - index;
      const adjustedDay = hijriDay > 0 ? hijriDay : hijriDay + 30;

      return {
        dateLabel: date.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        hijriLabel: `${adjustedDay} ${currentHijri.month.en}`,
      };
    });
  }, [currentHijri]);

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

  const hijriMonthNames = [
    "Muharram",
    "Safar",
    "Rabi' al-awwal",
    "Rabi' al-thani",
    "Jumada al-awwal",
    "Jumada al-thani",
    "Rajab",
    "Sha'ban",
    "Ramadan",
    "Shawwal",
    "Dhu al-Qi'dah",
    "Dhu al-Hijjah",
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
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

  const convertGregorianToHijri = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);

    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();

    const a = Math.floor((14 - m) / 12);
    const y2 = y + 4800 - a;
    const m2 = m + 12 * a - 3;
    const jdn =
      d +
      Math.floor((153 * m2 + 2) / 5) +
      365 * y2 +
      Math.floor(y2 / 4) -
      Math.floor(y2 / 100) +
      Math.floor(y2 / 400) -
      32045;

    let islamic = jdn - 1948440 + 10632;
    const n = Math.floor((islamic - 1) / 10631);
    islamic = islamic - 10631 * n + 354;
    const j =
      Math.floor((10985 - islamic) / 5316) *
        Math.floor((50 * islamic) / 17719) +
      Math.floor(islamic / 5670) * Math.floor((43 * islamic) / 15238);
    islamic =
      islamic -
      Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) +
      29;
    const month = Math.floor((24 * islamic) / 709);
    const dayHijri = islamic - Math.floor((709 * month) / 24);
    const yearHijri = 30 * n + j - 30;

    return {
      day: String(dayHijri),
      month: {
        number: month,
        en: hijriMonthNames[month - 1] || "",
      },
      year: String(yearHijri),
    };
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
                  const firstDayHijri = convertGregorianToHijri(1);
                  const lastDay = getDaysInMonth(viewYear, viewMonth);
                  const lastDayHijri = convertGregorianToHijri(lastDay);
                  if (firstDayHijri.month.en === lastDayHijri.month.en) {
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
                const derivedHijri = day ? convertGregorianToHijri(day) : null;
                const holidays = day ? getHolidaysForDate(day) : [];
                const isToday =
                  day === new Date().getDate() &&
                  viewMonth === new Date().getMonth() &&
                  viewYear === new Date().getFullYear();

                const displayHijri = hijri || derivedHijri;

                return (
                  <div
                    key={`date-${idx}`}
                    className={`date-cell ${day === null ? "empty" : ""} ${isToday ? "today" : ""}`}
                  >
                    {day && (
                      <>
                        <div className="gregorian-date">{day}</div>
                        {displayHijri && (
                          <div className="hijri-date">
                            {displayHijri.day}{" "}
                            {/* {displayHijri.month.en.slice(0, 3)} */}
                          </div>
                        )}
                        {holidays.length > 0 && (
                          <div className="holidays">
                            {holidays.map((holiday, i) => (
                              <div key={i} className="holiday-name">
                                {holiday}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
