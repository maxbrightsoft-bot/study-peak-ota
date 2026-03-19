import moment from 'moment';
import { MILLISECONDS_PER_HOUR, timeTypeOptions, TOTAL_SECONDS_IN_A_MINUTE, TOTAL_SECONDS_IN_AN_HOUR } from './constants';

export const getWeekTimestampArray = (weekNumber: number) => {
  let startOfWeek: moment.Moment;

  if (weekNumber === 0) {
    const lastYear = moment().year() - 1;
    const lastISOWeek = moment(`${lastYear}-12-31`).isoWeek();
    startOfWeek = moment().year(lastYear).isoWeek(lastISOWeek).startOf('isoWeek');
  } else {
    startOfWeek = moment().isoWeek(weekNumber).startOf('isoWeek');
  }

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.clone().add(i, 'day').startOf('day').valueOf()
  );

  const endOfSunday = startOfWeek.clone().add(6, 'day').endOf('day').valueOf();

  return [...weekDays, endOfSunday];
};

export const getWeekOfMonth = (date: moment.Moment) => {
  const startWeek = moment(date).startOf('month').week();
  const currentWeek = moment(date).week();
  return currentWeek - startWeek + 1;
};

export const getWeekCountOfMonth = (month: number, year: number = moment().year()) => {
  const start = moment([year, month]).startOf('month');
  const end = moment([year, month]).endOf('month');

  const isoWeeks = new Set<number>();
  const cursor = start.clone();

  while (cursor.isSameOrBefore(end, 'day')) {
    isoWeeks.add(cursor.isoWeek());
    cursor.add(1, 'day');
  }

  return isoWeeks.size;
};

export const getMonthTimeStampArray = (monthNumber: number, yearNumber: number) => {
  const start = moment([yearNumber, monthNumber]).startOf('month');
  const end = moment([yearNumber, monthNumber]).endOf('month');

  const weekStarts = new Set<number>();

  let cursor = start.clone();
  while (cursor.isSameOrBefore(end, 'day')) {
    const weekStart = cursor.clone().startOf('isoWeek');

    const isSameMonth = weekStart.month() === monthNumber
    weekStarts.add((isSameMonth ? weekStart : start).startOf('day').valueOf());

    cursor.add(1, 'day');
  }
  const endDayOfWeek = end.endOf('day').valueOf()

  const startDayOfWeek = Array.from(weekStarts).sort((a, b) => a - b);
  return [...startDayOfWeek, endDayOfWeek]
};

export const getYearTimeStampArray = (yearNumber: number) => {
  const endDayOfYear = moment().year(yearNumber).month(11).endOf('month').endOf('day').valueOf()

  const startDayOfMonths = Array.from({ length: 12 }, (_, i) =>
    moment().year(yearNumber).month(i).startOf('month').startOf('day').valueOf()
  );
  return [...startDayOfMonths, endDayOfYear]
};

export const sum = (arr: any[], key?: any, isTimerTab = true) => {
  if (!arr) return 0
  const val = arr.reduce((acc, cur) => {
    if (key === undefined) {
      return acc + (typeof cur === 'number' ? cur : 0)
    }
    return acc + (cur?.[key] || 0)
  }, 0)
  return isTimerTab ? val / MILLISECONDS_PER_HOUR : val || 0
}

const getIsoWeeksInMonth = () => {
  const m = moment()
  const start = m.clone().startOf('month');
  const end = m.clone().endOf('month');
  const isoWeeks = new Set<number>();

  const current = start.clone();
  while (current.isSameOrBefore(end)) {
    isoWeeks.add(current.isoWeek());
    current.add(1, 'day');
  }

  return Array.from(isoWeeks.values());
};

export const getCurrentTimeOptions = (t: any, timeType: number) => {
  switch (timeType) {
    case timeTypeOptions(t)[0].value:
      const month = moment().month()
      const monthName = moment().format('MMMM');
      const isoWeeks = getIsoWeeksInMonth();

      return isoWeeks.map((isoWeek, index) => ({
        label: t('week_of_month', { week: index + 1, month: month + 1, monthName }),
        value: isoWeek
      }));

    case timeTypeOptions(t)[1].value:
      return Array.from({ length: 12 }, (_, i) => {
        const monthName = moment().month(i).format('MMMM');
        return {
          label: monthName,
          value: i
        }
      }
      );

    case timeTypeOptions(t)[2].value:
      const currentYear = moment().year()
      return Array.from({ length: 10 }, (_, i) => ({
        label: t('year_number', { year: currentYear - i }),
        value: currentYear - i
      })).reverse()
    default: return []
  }
}

export const getWeekOfMonthFromISOWeek = (isoWeekNumber: number) => {
  const date = moment().isoWeek(isoWeekNumber).startOf('isoWeek');

  const startOfMonth = date.clone().startOf('month');
  const currentWeekYear = date.isoWeekYear();
  const startWeekYear = startOfMonth.isoWeekYear();

  const currentISOWeek = date.isoWeek();
  const startISOWeek = startOfMonth.isoWeek();

  let weekOfMonth;

  if (currentWeekYear > startWeekYear) {
    weekOfMonth = currentISOWeek;
  } else {
    weekOfMonth = currentISOWeek - startISOWeek + 1;
  }

  return weekOfMonth;
};

const transformsString = (num: number) => {
  return num.toString().padStart(2, "0")
}

export const formatTime = (totalSeconds: number, t: any): string => {
  const hours = Math.floor(totalSeconds / TOTAL_SECONDS_IN_AN_HOUR)
  const minutes = Math.floor(
    (totalSeconds % TOTAL_SECONDS_IN_AN_HOUR) / TOTAL_SECONDS_IN_A_MINUTE
  )
  const seconds = roundTo(totalSeconds % TOTAL_SECONDS_IN_A_MINUTE, 0)

  if (hours > 0) {
    return `${transformsString(hours)}${t("hour_h")} ${transformsString(minutes)}${t("minutes")} ${transformsString(seconds)}${t("seconds")}`
  }
  if (minutes > 0) {
    return `${transformsString(minutes)}${t("minutes")} ${transformsString(seconds)}${t("seconds")}`
  }
  return `${transformsString(seconds)}${t("seconds")}`
}

export const roundTo = (n: number, digits: number) => {
  const factor = Math.pow(10, digits);
  return Math.round(n * factor) / factor;
}

export const ceilTo = (n: number, digits: number) => {
  const factor = Math.pow(10, digits);
  return Math.ceil(n * factor) / factor;
}

export const calcFocusTime = (pTimes?: number[], isTimer = false) => {
  if (!pTimes?.length) return 0
  return isTimer ? pTimes.reduce((acc, cur) => acc += cur, 0) / MILLISECONDS_PER_HOUR : pTimes.reduce((acc, cur) => acc += cur, 0)
}

export const getColorDistance = (c1: number[], c2: number[]) => {
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  );
}

export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

export const hslToHex = (h: number, s: number, l: number): string => {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const getRandomColors = (
  length: number,
  _minDistance = 50,
  _maxAttempts = 500
): string[] => {
  return Array.from({ length }, (_, i) => {
    const hue = (360 / length) * i + Math.random() * (360 / length / 2);
    const saturation = 65 + Math.random() * 20  // 65–85%
    const lightness = 65 + Math.random() * 10   // 65–75%
    return hslToHex(hue % 360, saturation, lightness);
  });
};

export const getRandomRGB = (): number[] => {
  return [
    Math.floor(Math.random() * 156),
    Math.floor(Math.random() * 156),
    Math.floor(Math.random() * 156)
  ];
}

export const getDefaultCurrentTimeOption = (t: any, timeType: number) => {
  const now = moment();
  const currentMap = {
    0: now.isoWeek(),
    1: now.month(),
    2: now.year()
  };

  const currentVal = getCurrentTimeOptions(t, timeType).find(
    (i) => i.value === (currentMap as any)?.[timeType]
  )?.value;

  return currentVal || getCurrentTimeOptions(t, timeType)[0]?.value
}

export const resizeArray = (arr: number[], targetLength: number, fillValue = 0) => {
  const copy = arr.slice(0, targetLength);
  while (copy.length < targetLength) {
    copy.push(fillValue);
  }
  return copy;
}


export const getXLabel = (t: any, timeType: number, currentTime: number, label: string, isCurrentSelected = false) => {
  switch (timeType) {
    case timeTypeOptions(t)[0].value:
      const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayIndex = weekDays.indexOf(label);
      const baseDate = moment().isoWeek(isCurrentSelected ? currentTime : currentTime - 1).startOf('isoWeek');

      const targetDate = baseDate.add(dayIndex, 'days');

      return targetDate.format(t('date_format'))

    case timeTypeOptions(t)[1].value:
      return t(isCurrentSelected ? 'current_month' : 'last_month')

    case timeTypeOptions(t)[2].value:
      return t(isCurrentSelected ? 'current_year' : 'last_year')
    default: return ''
  }
}