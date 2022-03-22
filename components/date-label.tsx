import { intervalToDuration } from "date-fns";
import { useTranslation } from "next-i18next";

interface IDataLabelProps {
  date: Date | number;
  className?: string;
}
export default function DateLabel({ date, className }: IDataLabelProps) {
  const { t } = useTranslation("common");

  const duration = intervalToDuration({
    start: new Date(date),
    end: new Date()
  });

  const translated = (measure: string, amount = 0) =>
    `${amount} ${t(`info-data.${measure}${amount > 1 ? "_other" : ""}`)}`;

  const groups: string[][] = [
    ["years", "months"],
    ["months", "days"],
    ["days", "hours"],
    ["hours", "minutes"],
    ["minutes"]
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

  return (
    <span className={`caption-small ${className || "text-ligth-gray"}`}>
      {date &&
        t("info-data.text-data", {
          value: handleDurationTranslation().join(" ")
        })}
    </span>
  );
}
