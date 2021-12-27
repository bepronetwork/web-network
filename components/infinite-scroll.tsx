import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'

import UpDoubleArrow from '@assets/icons/up-double-arrow'
import DownDoubleArrow from '@assets/icons/down-double-arrow'

import Button from '@components/button'

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

    if (newPage < 1 || isLoading) return

    router.push({
      pathname: './',
      query: {
        ...router.query,
        page: newPage
      }
    })
  }

  function handleNextPage() {
    const newPage = page + 1

    if (newPage > pages || isLoading) return

    const query = {
      ...router.query,
      page: newPage
    }

    router.push({
      pathname: './',
      query
    })
  }

  function handleScrolling(event) {
    if (!event.path.find(el => el.id === 'infinite-scroll')) return

    if (event.deltaY < 0) handlePreviousPage()
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
      {(page > 1 && (
        <div className="row justify-content-center">
          <Button transparent onClick={handlePreviousPage}>
            <UpDoubleArrow />
          </Button>
        </div>
      )) || <></>}

      {children}

      {(page < pages && (
        <div className="row justify-content-center">
          <Button transparent onClick={handleNextPage}>
            <DownDoubleArrow />
          </Button>
        </div>
      )) || <></>}
    </div>
  )
}
