import { GetStaticProps } from 'next'
import { useEffect, useState } from 'react';

export default function Home() {
  return (
      <div>
        <h1>Bepronetwork</h1>
      </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
