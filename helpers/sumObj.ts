export default function sumObj(params: Object): number {
  let sum = 0;
  for (const prop in params) {
    if (params.hasOwnProperty(prop)) {
      sum += parseFloat(params[prop]);
    }
  }
  return sum;
}
