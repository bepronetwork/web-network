import { useTranslation } from 'next-i18next'

export default function ClosedNetworkAlert() {
  const { t } = useTranslation('common')

  return (
    <div className="bg-shadow">
      <div className="d-flex align-items-center justify-content-center caption-medium text-danger bg-danger-30 w-100 py-1">
        <span>{t('errors.read-only-network')}</span>
      </div>
    </div>
  )
}
