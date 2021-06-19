export function sumObj(params: Object) {
  let sum = 0;
  for (const prop in params) {
    if (params.hasOwnProperty(prop)) {
      sum += parseFloat(params[prop]);
    }
  }
  return sum;
}
