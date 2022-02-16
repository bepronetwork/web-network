import { useEffect, useState } from 'react'

import useNetwork from '@x-hooks/use-network'

export default function NetworkThemeInjector() {
  const [currentColors, setCurrentColors] = useState('')

  const { network, colorsToCSS } = useNetwork()

  useEffect(() => {
    setCurrentColors(colorsToCSS())
  }, [network])

  return (
    <>
      <style>{currentColors}</style>
    </>
  )
}
