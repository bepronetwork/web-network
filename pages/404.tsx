import { useTranslation } from 'next-i18next'

import InternalLink from '@components/internal-link';

import NotFoundIcon from '../assets/icons/not-found-icon';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getSession } from 'next-auth/react';

export default function NotFound() {
  const { t } = useTranslation('common')

  return <div className="pt-5">
    <div className="row pt-5 mt-5">
      <div className="col d-flex justify-content-center mt-5 pt-5">
        <NotFoundIcon height={131} width={118}/>
      </div>
    </div>
    <div className="row my-auto pt-4">
      <div className="col text-center">
        <h2 className="h2 text-white text-opacity-1 mb-2">
          {t('404.the-page')}{" "}
          <span className="text-primary">{t('404.not-found')}</span>
        </h2>
        <p className="mb-2">
          {t('404.the-link-may-be-moved')}
        </p>
        <div className='d-flex justify-content-center align-items-center'>
          <InternalLink href="/" className="mt-3" label={String(t('404.back-to-home'))} uppercase />
        </div>
      </div>
    </div>
  </div>  
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
