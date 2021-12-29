import { ReactNode, useEffect } from 'react'

import DownDoubleArrow from '@assets/icons/down-double-arrow'

import { useRouter } from 'next/router'

interface InfiniteScrollProps {
  pages: number
  page: number
  isLoading: boolean
  children: ReactNode | ReactNode[]
}

export default function InfiniteScroll({
  pages,
  page,
  isLoading,
  children
}: InfiniteScrollProps) {
  const router = useRouter()

  function handlePreviousPage() {
    const newPage = page - 1

    if (newPage < 1 || isLoading || window.scrollY > 0) return
  }

  function handleNextPage() {
    const newPage = page + 1

    if (
      newPage > pages ||
      isLoading ||
      window.innerHeight + window.scrollY < document.body.offsetHeight
    )
      return

    router.push(
      {
        pathname: `.${router.pathname}`,
        query: {
          ...router.query,
          page: newPage
        }
      },
      router.pathname,
      { shallow: true }
    )
  }

  function handleScrolling(event) {
    if (event.deltaY < 0) return
    //handlePreviousPage()
    else handleNextPage()
  }

  useEffect(() => {
    window.addEventListener('wheel', handleScrolling, true)

    return () => {
      window.removeEventListener('wheel', handleScrolling)
    }
  }, [page, pages, isLoading])

  return (
    <div id="infinite-scroll">
      {children}
    </div>
  )
}
