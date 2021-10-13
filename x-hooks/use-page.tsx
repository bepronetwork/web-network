import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';

export default function usePage() {
  const [page, setPage] = useState('1');
  const {query} = useRouter();

  useEffect(() => {
    setPage(query?.page as string || '1');
  }, [query])

  return page;
}
