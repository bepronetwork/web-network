import {useQuery, useQueryClient, UseQueryOptions} from "@tanstack/react-query";


export default function useReactQuery<T>( key: (string | number)[], 
                                          getFn: () => Promise<T>, 
                                          options?: UseQueryOptions<T>) {
  const query = useQuery<T>({
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