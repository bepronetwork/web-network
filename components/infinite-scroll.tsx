import { ReactNode, useEffect } from 'react'

import DownDoubleArrow from '@assets/icons/down-double-arrow'

import Button from '@components/button'

interface InfiniteScrollProps {
  pages: number
  page: number
  isLoading: boolean
  children: ReactNode | ReactNode[]
  handlePageChanged: (newPage: number) => void
}

export default function InfiniteScroll({
  pages,
  page,
  isLoading,
  children,
  handlePageChanged
}: InfiniteScrollProps) {

  function handlePreviousPage() {
    const newPage = page - 1

    if (newPage < 1 || isLoading || window.scrollY > 0) return

    handlePageChanged(newPage)
  }

  function handleNextPage() {
    const newPage = page + 1

    if (newPage > pages || isLoading || (window.innerHeight + window.scrollY < document.body.offsetHeight)) return

    handlePageChanged(newPage)
  }

  function handleScrolling(event) {
    if (event.deltaY < 0) return //handlePreviousPage()
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
      {console.log({pages, page})}
      {children}
    </div>
  )
}
