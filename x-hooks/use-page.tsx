import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function usePage() {
  const [pageState, setPageState] = useState('1')
  const router = useRouter()
  const { page } = router.query

  useEffect(() => {
    setPageState(String(page || 1))
  }, [page])

  function setPage(newPage: number) {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          page: String(newPage)
        }
      },
      router.asPath,
      { shallow: false, scroll: false }
    )
  }

  function nextPage() {
    setPage(+(page || 1) + 1)
  }

  function goToFirstPage() {
    setPage(1)
  }

  return {
    page: pageState,
    setPage,
    nextPage,
    goToFirstPage
  }
}
