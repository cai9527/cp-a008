import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

export const useClock = () => {
  const [now, setNow] = useState(dayjs());
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [weekday, setWeekday] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const current = dayjs();
      setNow(current);
      setDateStr(current.format('YYYY年MM月DD日'));
      setTimeStr(current.format('HH:mm:ss'));
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      setWeekday(weekdays[current.day()]);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return {
    now,
    dateStr,
    timeStr,
    weekday,
  };
};
