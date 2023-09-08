import { useQuery, useQueryClient } from "@tanstack/react-query";

interface useReactQueryOptions<T> {
  enabled?: boolean;
  staleTime?: number;
  onSuccess?: (data: T) => void;
  onSettled?: (...params) => void;
}
export default function useReactQuery<T>( key: (string | number)[], 
                                          getFn: () => Promise<T>, 
                                          options?: useReactQueryOptions<T>) {
  const query = useQuery({
    queryKey: key, 
    queryFn: getFn,
    ...options
  });
  const queryClient = useQueryClient();

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: key });
  }

  return {
    ...query,
    invalidate
  };
}