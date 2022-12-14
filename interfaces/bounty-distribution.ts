export interface BountyDistribution {
    percentage: string;
    amounts: string[];
    symbols: string[];
    name: string;
    description: string;
    line?: boolean
    githubLogin?: string;
  }