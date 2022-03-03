import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function useSearch() {
  const router = useRouter()
  const { search } = router.query
  const [searchState, setSearchState] = useState(search || '')

  useEffect(() => {
    setSearchState(search || '')
  }, [search])

  function setSearch(newSearch: string) {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          page: '1',
          search: String(newSearch)
        }
      },
      router.asPath
    )
  }

  function clearSearch() {
    setSearch('')
  }

  return {
    search: String(searchState),
    setSearch,
    clearSearch
  }
}
