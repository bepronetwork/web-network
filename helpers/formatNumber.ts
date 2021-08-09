export const formatNumberToString = (number: number | string, decimals=4) => {
  return parseFloat(`${number}`).toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}