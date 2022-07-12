import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PageHero from '@components/page-hero'
import ListIssues from '@components/list-issues'

export default function PageCouncil() {
  const { t } = useTranslation(['common', 'council'])

  return (
    <div>
      <PageHero title={t('council:title')} />

      <ListIssues filterState="ready" emptyMessage={t('council:empty')} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'bounty', 'council']))
    }
  }
}
