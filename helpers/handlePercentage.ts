export const handlePercentage = (value: number, amount: number) =>
  (value * 100) / amount;

  
export const handlePercentToRange = (ammount: number, value: number, percentage: number) => (ammount / (value * (percentage/100))) * 100;