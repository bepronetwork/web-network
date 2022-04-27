export interface SearchBounties {
  page?: number;
  repoId?: number;
  time?: number;
  state?: 'all' | 'open' | 'draft' | 'closed';
  search?: string;
  sortBy?: 'creation' | 'amount';
  order?: 'asc' | 'desc';
  partial?: number;
}