export const toNumber = (v: number|string) => +v.toString().replace(',', '').replace(/\D+/g, '.');

export const formatNumberEnGb = (v: number|string) => {
  return new Intl.NumberFormat('en-gb', {style: 'currency', currency: 'GBP'}).format(toNumber(v));
}

export const NumberTransformation = {toNumber, formatNumberEnGb};
