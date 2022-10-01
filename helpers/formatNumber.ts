export const formatNumberToString = (number: number | string, decimals = 4) => {
  return parseFloat(`${number}`)
    .toFixed(decimals)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");
};

export const formatNumberToNScale = (number: number) => {
  if (number < 1e3) return number;
  if (number >= 1e3 && number < 1e6) return +(number / 1e3).toFixed(1) + "K";
  if (number >= 1e6 && number < 1e9) return +(number / 1e6).toFixed(1) + "M";
  if (number >= 1e9 && number < 1e12) return +(number / 1e9).toFixed(1) + "B";
  if (number >= 1e12) return +(number / 1e12).toFixed(1) + "T";
};

export const formatNumberToCurrency = (number: number | string, options = {}) =>
  new Intl.NumberFormat("en", options).format(Number(number));

export const formatStringToCurrency = (numStr: string) => {
  if (numStr?.toString()?.trim() === "" || numStr === undefined || !numStr) return "0";

  const [ rest, decimals ] = numStr.toString().split(".");

  const decimalsStr = decimals ? `.${decimals}` : "";
  
  return `${rest.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${decimalsStr}`;
}