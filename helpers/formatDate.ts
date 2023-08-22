import { differenceInDays, differenceInMonths, differenceInYears, formatDistanceStrict, parseISO } from "date-fns";

export const formatDate = (date: number | string | Date, joiner = "/") => {
  try {
    const d = ["string", "number"].includes(typeof date)
      ? new Date(date)
      : (date as Date);
    return [
      `0${d.getDate()}`.slice(-2),
      `0${d.getMonth() + 1}`.slice(-2),
      d.getFullYear()
    ].join(joiner);
  } catch (e) {
    return `0`;
  }
};

export const getTimeDifferenceInWords = (date: Date, dateToCompare: Date, addSuffix = false) => {
  try {
    return formatDistanceStrict(date, dateToCompare, {
      addSuffix
    });
  } catch (e) {
    return `0`;
  }
};

export function getDifferenceBetweenDates(startDate: string | Date, 
                                          endDate: string | Date, 
                                          diffIn: "days" | "months" | "years") {
  if (!startDate || !endDate) return null;

  const diffFn = {
    days: differenceInDays,
    months: differenceInMonths,
    years: differenceInYears,
  }[diffIn];

  return diffFn(parseISO(endDate.toString()), parseISO(startDate.toString()));
}