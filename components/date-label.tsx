import { useEffect, useState } from "react";

import { Duration, intervalToDuration } from "date-fns";
import { useTranslation } from "next-i18next";

interface IDataLabelProps {
  date: Date;
  className?: string;
}
export default function DateLabel({ date, className }: IDataLabelProps) {
  const { t } = useTranslation("common");

  const [duration, setDuration] = useState<Duration>();

  const translated = (measure: string, count = 0) =>
    `${count} ${t(`info-data.${measure}`, { count })}`;

  const groups: string[][] = [
    ["years", "months"],
    ["months", "days"],
    ["days", "hours"],
    ["hours", "minutes"],
    ["minutes"],
    ["seconds"]
  ];

  function handleDurationTranslation() {
    const _string: string[] = [];
    let i = 0;
    for (i; i <= groups.length - 1; i++) {
      const [m1, m2] = groups[i] as string[];

      if (duration[m1]) {
        _string.push(translated(m1, duration[m1]));
        if (duration[m2]) _string.push(translated(m2, duration[m2]));
      }

      if (_string.length) i = groups.length;
    }
    return _string;
  }

  useEffect(() => {
    if (!date) return;

    const start = date;
    const end = new Date();

    setDuration(intervalToDuration({
      start: start > end ? end : start,
      end: end
    }));
  }, [date]);

  return (
    <span className={`caption-small font-weight-500 ${className || "text-light-gray"}`}>
      {duration &&
        t("info-data.text-data", {
          value: handleDurationTranslation().join(" ")
        })}
    </span>
  );
}
