import { formatDistanceStrict } from "date-fns";

export const formatDate = (date: number|string|Date, joiner = '/') => {
  const d = ['string', 'number'].includes(typeof date) ? new Date(date) : date as Date;
  return [d.getDate(), d.getMonth()+1, d.getFullYear()].join(joiner);
}

export const getTimeDifferenceInWords = (date: Date, dateToCompare: Date) => {
  return formatDistanceStrict( date, dateToCompare );
}