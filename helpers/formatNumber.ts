import BigNumber from 'bignumber.js';

export const formatNumberToString = (number: number | string, decimals = 4) => {
  return parseFloat(`${number}`)
    .toFixed(decimals)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");
};

export const formatNumberToNScale = (number: number | string, fixed = 2, spacer = ` `) => {
  if((typeof number === 'string' && number === "0") || !number) return '0'

  const bigNumber = new BigNumber(number);

  if (bigNumber.lt(1e3))
    return bigNumber.toFixed( bigNumber.lt(1) ? (+number.toString().split(`.`)?.[1]?.length || 2) : fixed);

  const units = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg', 'Uvg', 'Dvg']; // eslint-disable-line
  const zeroes = Math.floor(bigNumber.dividedBy(1.0e+1).toFixed(0).toString().length); // eslint-disable-line
  const zeroesMod = zeroes % 3 // 3 = 000
  const retNumber = Math.abs(+bigNumber.dividedBy(`1.0e+${zeroes-zeroesMod}`)).toFixed(fixed)
  const unit = units[Math.floor(+zeroes / 3) - 1];

  // console.log(`NUMBER TO SCALE`, retNumber, zeroes, zeroesMod, unit, Math.floor(+zeroes / 3) - 1);

  return `${retNumber}${spacer}${unit}`;
};

export const formatNumberToCurrency = (number: number | string, 
                                      options: Intl.NumberFormatOptions = { maximumFractionDigits: 2 }) =>
  new Intl.NumberFormat("en", options).format(Number(number));

export const formatStringToCurrency = (numStr: string) => {
  if (numStr?.toString()?.trim() === "" || numStr === undefined || !numStr) return "0";

  const [ rest, decimals ] = numStr.toString().split(".");

  const decimalsStr = decimals ? `.${decimals}` : "";

  return `${rest.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${decimalsStr}`;
}