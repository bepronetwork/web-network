import { useEffect, useState } from 'react'

import useNetworkTheme from '@x-hooks/use-network'

export default function NetworkThemeInjector() {
  const [currentColors, setCurrentColors] = useState('')

  const { network, colorsToCSS } = useNetworkTheme()

  useEffect(() => {
    setCurrentColors(colorsToCSS())
  }, [network])

  return (
    <>
      <style>{currentColors}</style>
    </>
  )
}
