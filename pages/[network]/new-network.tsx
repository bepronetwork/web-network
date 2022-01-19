import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import CustomContainer from '@components/custom-container'

export default function NewNetwork() {
  return (
    <div>
      <CustomContainer>
      <div className="mt-5 pt-4">
        <h1>New Network</h1>
      </div>
    </CustomContainer>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'bounty']))
    }
  }
}
