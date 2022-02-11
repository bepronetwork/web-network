import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import ImageUploader from '@components/image-uploader'
import CustomContainer from '@components/custom-container'
import AmountCard from '@components/custom-network/amount-card'
import ThemeColors from '@components/custom-network/theme-colors'
import ConnectWalletButton from '@components/connect-wallet-button'
import RepositoriesList from '@components/custom-network/repositories-list'

import { formatDate } from '@helpers/formatDate'
import { getQueryableText } from '@helpers/string'
import { DefaultNetworkInformation } from '@helpers/custom-network'

import useNetwork from '@x-hooks/use-network'

import { IPFS_BASE } from 'env'
import useApi from '@x-hooks/use-api'

export default function Settings() {
  const [newInfo, setNewInfo] = useState(DefaultNetworkInformation)

  const { searchRepositories } = useApi()
  const { network, colorsToCSS } = useNetwork()

  function showTextOrDefault(text: string, defaultText: string) {
    return text?.trim() === '' ? defaultText : text
  }

  async function loadData() {
    const infoToUpdate = Object.assign(newInfo, {})

    infoToUpdate.network.data.colors.data = network.colors
    infoToUpdate.network.data.logoIcon.preview = `${IPFS_BASE}/${network.logoIcon}`
    infoToUpdate.network.data.fullLogo.preview = `${IPFS_BASE}/${network.fullLogo}`

    try {
      const { rows } = await searchRepositories({ networkName: network.name })

      infoToUpdate.repositories.data = rows.map(row => ({
        checked: false,
        name: row.githubPath.split('/')[1],
        fullName: row.githubPath
      }))
    } catch (error) {
      console.log(error)
    }

    setNewInfo(infoToUpdate)
  }

  useEffect(() => {
    if (!network) return

    loadData()
  }, [network])

  return (
    <div>
      <style>{colorsToCSS(newInfo.network.data.colors.data)}</style>

      <ConnectWalletButton asModal={true} />

      <CustomContainer>
        <div className="row mt-5 pt-5 justify-content-center">
          <div className="col-11">
            <div className="d-flex flex-row gap-20">
              <div className="d-flex flex-column justify-content-end">
                <ImageUploader
                  name="logoIcon"
                  value={newInfo.network.data.logoIcon}
                  className="bg-shadow"
                  error={
                    newInfo.network.data.logoIcon.raw &&
                    !newInfo.network.data.logoIcon.raw?.type?.includes(
                      'image/svg'
                    )
                  }
                  onChange={() => {}}
                  description={
                    <>
                      upload <br /> logo icon
                    </>
                  }
                />
              </div>

              <div className="d-flex flex-column justify-content-end">
                <ImageUploader
                  name="fullLogo"
                  value={newInfo.network.data.fullLogo}
                  className="bg-shadow"
                  error={
                    newInfo.network.data.fullLogo.raw &&
                    !newInfo.network.data.fullLogo.raw?.type?.includes(
                      'image/svg'
                    )
                  }
                  onChange={() => {}}
                  description="upload full logo"
                  lg
                />
              </div>

              <div className="d-flex flex-column justify-content-end">
                <p className="h3 text-white mb-3 text-capitalize">
                  {showTextOrDefault(network?.name, 'Network name')}
                </p>
                <p className="caption-small text-ligth-gray mb-2">query url</p>
                <p className="caption-small text-gray">
                  development.bepro.network/
                  <span className="text-primary">
                    {showTextOrDefault(
                      getQueryableText(network?.name || ''),
                      'network-name'
                    )}
                  </span>
                </p>
              </div>

              <div className="d-flex flex-column justify-content-end caption-small">
                <span className="text-ligth-gray mb-2">creation date</span>
                <span className="text-gray">
                  {network?.createdAt
                    ? formatDate(network?.createdAt, '-')
                    : ''}
                </span>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-4">
                <AmountCard
                  title="$TOKEN staked"
                  description="amount staked"
                  currency="token"
                  amount={304403}
                />
              </div>

              <div className="col-4">
                <AmountCard
                  title="oracles staked"
                  description="oracles staked"
                  currency="oracles"
                  amount={304403}
                />
              </div>

              <div className="col-4">
                <AmountCard
                  title="to unlock"
                  description="to unlock"
                  currency="token"
                  amount={304403}
                  action={{
                    label: 'claim',
                    fn: () => {}
                  }}
                />
              </div>
            </div>

            <div className="row mx-0 mt-4 p-20 border-radius-8 bg-shadow">
              <span className="caption-medium text-white mb-4">
                Network Settings
              </span>

              <RepositoriesList
                repositories={newInfo.repositories.data}
                onClick={() => {}}
              />

              <ThemeColors
                colors={newInfo.network.data.colors.data}
                similar={[]}
                setColor={() => {}}
              />
            </div>
          </div>
        </div>
      </CustomContainer>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, [
        'common',
        'connect-wallet-button',
        'my-oracles',
        'bounty',
        'pull-request'
      ]))
    }
  }
}
