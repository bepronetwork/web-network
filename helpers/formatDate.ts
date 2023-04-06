import { formatDistanceStrict } from "date-fns";

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

export const getTimeDifferenceInWords = (date: Date, dateToCompare: Date) => {
  try {
    return formatDistanceStrict(date, dateToCompare);
  } catch (e) {
    return `0`;
  }
};
