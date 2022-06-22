export interface BountyDistribution {
    percentage: number;
    amounts: number[];
    symbols: string[];
    name: string;
    description: string;
    line?: boolean
  }