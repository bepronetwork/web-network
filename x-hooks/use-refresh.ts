import { useRouter } from "next/router"

export default function useRefresh() {
  const router = useRouter();

  function refresh() {
    router.replace(router.asPath);
  }

  return {
    refresh
  }
}