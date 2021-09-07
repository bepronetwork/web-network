export const handlePercentage = (value: number, total: number) => (value * 100) / total;

export const handlePercentToRange = (ammount: number, total: number, percentage: number) => (ammount / (total * (percentage/100))) * 100;

export const handlePercentToSteps = (ammount = 0, total = 500, steps = 3) => ((ammount / total) * 100) / steps