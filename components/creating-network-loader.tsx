import LoadingDots from '@assets/icons/loading-dots'
import { useTranslation } from 'next-i18next'

export default function CreatingNetworkLoader() {
  const { t } = useTranslation(['custom-network'])

  return (
    <div className="creating-network-loader">
      <div className="d-flex flex-row align-items-end">
        <span className="caption-large text-white">{t('modals.loader.being-prepared')}</span> <LoadingDots />
      </div>
      <p className="caption-medium text-gray mt-1">
        {t('modals.loader.dont-close-window')}
      </p>
    </div>
  )
}
