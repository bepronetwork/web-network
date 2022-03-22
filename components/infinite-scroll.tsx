import { ReactNode, useEffect } from "react";
interface InfiniteScrollProps {
  handleNewPage: () => void;
  isLoading: boolean;
  hasMore: boolean;
  children: ReactNode | ReactNode[];
}

export default function InfiniteScroll({
  handleNewPage,
  hasMore,
  isLoading,
  children
}: InfiniteScrollProps) {
  function handleScrolling(entries, observer) {
    if (!hasMore || isLoading) return;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        handleNewPage();

        observer.disconnect();
      }
    });
  }

  const observer = new IntersectionObserver(handleScrolling, {
    root: null,
    rootMargin: "0px",
    threshold: 1.0
  });

  useEffect(() => {
    const childs = document.getElementById("infinite-scroll").children;

    if (childs.length) observer.observe(childs[childs.length - 1]);

    return () => {
      observer.unobserve(childs[childs.length - 1]);
    };
  }, [hasMore, isLoading]);

  return <div id="infinite-scroll">{children}</div>;
}
