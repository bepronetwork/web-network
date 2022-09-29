import BigNumber from 'bignumber.js';

export const formatNumberToString = (number: number | string, decimals = 4) => {
  return parseFloat(`${number}`)
    .toFixed(decimals)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");
};

export const formatNumberToNScale = (number: number | string) => {
  const bigNumber = new BigNumber(number);

  if (bigNumber.lt(1e3)) return bigNumber.toFixed();
  if (bigNumber.gte(1e3) && bigNumber.lt(1e6)) return bigNumber.dividedBy(1e3).toFixed(1, 1) + "K";
  if (bigNumber.gte(1e6) && bigNumber.lt(1e9)) return bigNumber.dividedBy(1e6).toFixed(1, 1) + "M";
  if (bigNumber.gte(1e9) && bigNumber.lt(1e12)) return bigNumber.dividedBy(1e9).toFixed(1, 1) + "B";
  if (bigNumber.gte(1e12)) return bigNumber.dividedBy(1e12).toFixed(1, 1) + "T";
};

export const formatNumberToCurrency = (number: number | string, options = {}) =>
  new Intl.NumberFormat("en", options).format(Number(number));

export const formatStringToCurrency = (numStr: string) => {
  if (numStr?.toString()?.trim() === "" || numStr === undefined || !numStr) return "0";

  const [ rest, decimals ] = numStr.toString().split(".");

  const decimalsStr = decimals ? `.${decimals}` : "";
  
  return `${rest.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${decimalsStr}`;
}