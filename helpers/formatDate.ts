import { formatDistanceStrict } from "date-fns";

export const formatDate = (date: string|Date, joiner = '/') => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return [d.getDate(), d.getMonth()+1, d.getFullYear()].join(joiner);
}

export const getTimeDifferenceInWords = (date: Date, dateToCompare: Date) => {
  return formatDistanceStrict( date, dateToCompare );
}