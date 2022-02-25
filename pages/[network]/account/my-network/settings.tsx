import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useContext, useEffect, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import LockedIcon from '@assets/icons/locked-icon'

import Button from '@components/button'
import InputNumber from '@components/input-number'
import ImageUploader from '@components/image-uploader'
import CustomContainer from '@components/custom-container'
import AmountCard from '@components/custom-network/amount-card'
import ThemeColors from '@components/custom-network/theme-colors'
import ConnectWalletButton from '@components/connect-wallet-button'
import RepositoriesList from '@components/custom-network/repositories-list'

import { addToast } from '@contexts/reducers/add-toast'
import { ApplicationContext } from '@contexts/application'

import { isSameSet } from '@helpers/array'
import { formatDate } from '@helpers/formatDate'
import { isColorsSimilar } from '@helpers/colors'
import { psReadAsText } from '@helpers/file-reader'
import { formatNumberToCurrency } from '@helpers/formatNumber'
import { DefaultNetworkInformation } from '@helpers/custom-network'
import { getQueryableText, urlWithoutProtocol } from '@helpers/string'

import { BeproService } from '@services/bepro-service'

import useApi from '@x-hooks/use-api'
import useOctokit from '@x-hooks/use-octokit'
import useNetwork from '@x-hooks/use-network'

import {
  API,
  IPFS_BASE,
  REDEEM_TIME_MAX,
  REDEEM_TIME_MIN,
  COUNCIL_AMOUNT_MIN,
  COUNCIL_AMOUNT_MAX,
  DISPUTABLE_TIME_MAX,
  DISPUTABLE_TIME_MIN,
  DISPUTE_PERCENTAGE_MAX
} from 'env'
interface NetworkAmounts {
  tokenStaked: number
  oraclesStaked: number
}

export default function Settings() {
  const router = useRouter()
  const { t } = useTranslation(['common', 'custom-network'])

  const [isClosing, setIsClosing] = useState(false)
  const [isAbleToClose, setIsAbleToClose] = useState(false)

  const [newInfo, setNewInfo] = useState({
    ...DefaultNetworkInformation,
    redeemTime: 0,
    disputeTime: 0,
    validated: false,
    councilAmount: 0,
    percentageForDispute: 0
  })

  const [currentNetworkParameters, setCurrentNetworkParameters] = useState({
    redeemTime: 0,
    disputeTime: 0,
    councilAmount: 0,
    percentageForDispute: 0
  })

  const [networkAmounts, setNetworkAmounts] = useState<NetworkAmounts>({
    tokenStaked: 0,
    oraclesStaked: 0
  })

  const [updatingNetwork, setUpdatingNetwork] = useState(false)

  const { listUserRepos } = useOctokit()
  const { searchRepositories, updateNetwork, isNetworkOwner } = useApi()
  const { network, colorsToCSS, handleNetworkChange, getURLWithNetwork } =
    useNetwork()

  const {
    dispatch,
    state: { currentAddress, githubLogin }
  } = useContext(ApplicationContext)

  const isValidDescription =
    newInfo.network.data.networkDescription.trim() !== ''
  const isValidPercentageForDispute =
    newInfo.percentageForDispute <= DISPUTE_PERCENTAGE_MAX
  const isValidRedeemTime =
    newInfo.redeemTime >= REDEEM_TIME_MIN &&
    newInfo.redeemTime <= REDEEM_TIME_MAX
  const isValidDisputeTime =
    newInfo.disputeTime >= DISPUTABLE_TIME_MIN &&
    newInfo.disputeTime <= DISPUTABLE_TIME_MAX
  const isValidCouncilAmount =
    newInfo.councilAmount >= COUNCIL_AMOUNT_MIN &&
    newInfo.councilAmount <= COUNCIL_AMOUNT_MAX

  function showTextOrDefault(text: string, defaultText: string) {
    return text?.trim() === '' ? defaultText : text
  }

  async function loadData() {
    const tmpInfo = Object.assign({}, newInfo)

    tmpInfo.network.data.colors.data = network.colors
    tmpInfo.network.data.networkDescription = network.description
    tmpInfo.network.data.logoIcon.preview = `${IPFS_BASE}/${network.logoIcon}`
    tmpInfo.network.data.fullLogo.preview = `${IPFS_BASE}/${network.fullLogo}`

    setNewInfo(tmpInfo)

    const redeemTime = await BeproService.getRedeemTime()
    const disputeTime = await BeproService.getDisputableTime()
    const councilAmount = await BeproService.getCouncilAmount()
    const percentageForDispute =
      await BeproService.getPercentageNeededForDispute()

    const tmpInfo2 = Object.assign({}, tmpInfo)

    tmpInfo2.redeemTime = redeemTime
    tmpInfo2.disputeTime = disputeTime
    tmpInfo2.councilAmount = councilAmount
    tmpInfo2.percentageForDispute = percentageForDispute

    setCurrentNetworkParameters({
      redeemTime,
      disputeTime,
      councilAmount,
      percentageForDispute
    })

    setNewInfo(tmpInfo2)

    const tmpRepos = await loadRepositories()

    const tmpInfo3 = Object.assign({}, tmpInfo2)

    tmpInfo3.repositories.data = tmpRepos

    setNewInfo(tmpInfo3)
  }

  async function loadAmounts() {
    try {
      const tokenStaked = await BeproService.getTokensStaked()
      const oraclesStaked = await BeproService.getBeproLocked()

      setNetworkAmounts({
        tokenStaked,
        oraclesStaked
      })
    } catch (error) {
      console.log('Failed to get network amounts', error)
    }
  }

  async function loadRepositories() {
    try {
      const { rows } = await searchRepositories({ networkName: network.name })

      const tmpRepos = rows.map((row) => ({
        checked: true,
        isSaved: true,
        name: row.githubPath.split('/')[1],
        fullName: row.githubPath
      }))

      if (githubLogin) {
        const {
          data: { items: githubRepos }
        } = await listUserRepos(githubLogin)

        const repos = githubRepos.map((repo) => ({
          checked: false,
          isSaved: false,
          name: repo.name,
          hasIssues: false,
          fullName: repo.full_name
        }))

        tmpRepos.push(
          ...repos.filter(
            (repo) =>
              !tmpRepos.map((repoB) => repoB.fullName).includes(repo.fullName)
          )
        )
      }

      return tmpRepos
    } catch (error) {
      console.log(error)
    }

    return []
  }

  function changeColor(newColor) {
    const tmpInfo = Object.assign({}, newInfo)

    tmpInfo.network.data.colors.data[newColor.label] = newColor.value

    setNewInfo(tmpInfo)
  }

  function handleNetworkDataChange(newData) {
    const tmpInfo = Object.assign({}, newInfo)

    tmpInfo.network.data[newData.label] = newData.value

    setNewInfo(tmpInfo)
  }

  function handleInputChange(label, value) {
    const tmpInfo = Object.assign({}, newInfo)

    tmpInfo[label] = value

    setNewInfo(tmpInfo)
  }

  function handleCheckRepository(repositoryName) {
    const tmpSteps = Object.assign({}, newInfo)

    const repositoryIndex = tmpSteps.repositories.data.findIndex(
      (repo) => repo.name === repositoryName
    )

    tmpSteps.repositories.data[repositoryIndex].checked =
      !tmpSteps.repositories.data[repositoryIndex].checked

    setNewInfo(tmpSteps)
  }

  async function handleSubmit() {
    if (!githubLogin || !currentAddress) return

    setUpdatingNetwork(true)

    const networkData = newInfo.network.data
    const repositoriesData = newInfo.repositories

    const json = {
      description: networkData.networkDescription,
      colors: JSON.stringify(networkData.colors.data),
      logoIcon: networkData.logoIcon.raw
        ? await psReadAsText(networkData.logoIcon.raw)
        : undefined,
      fullLogo: networkData.fullLogo.raw
        ? await psReadAsText(networkData.fullLogo.raw)
        : undefined,
      repositoriesToAdd: JSON.stringify(
        repositoriesData.data
          .filter((repo) => repo.checked && !repo.isSaved)
          .map(({ name, fullName }) => ({ name, fullName }))
      ),
      repositoriesToRemove: JSON.stringify(
        repositoriesData.data
          .filter((repo) => !repo.checked && repo.isSaved)
          .map(({ name, fullName }) => ({ name, fullName }))
      ),
      creator: currentAddress,
      githubLogin,
      networkAddress: network.networkAddress
    }

    updateNetwork(json)
      .then(async (result) => {
        if (currentNetworkParameters.redeemTime !== newInfo.redeemTime)
          await BeproService.setRedeemTime(newInfo.redeemTime)
            .then(console.log)
            .catch(console.log)

        if (currentNetworkParameters.disputeTime !== newInfo.disputeTime)
          await BeproService.setDisputeTime(newInfo.disputeTime)
            .then(console.log)
            .catch(console.log)

        if (currentNetworkParameters.councilAmount !== newInfo.councilAmount)
          await BeproService.setCouncilAmount(newInfo.councilAmount)
            .then(console.log)
            .catch(console.log)

        if (
          currentNetworkParameters.percentageForDispute !==
          newInfo.percentageForDispute
        )
          await BeproService.setPercentageForDispute(
            newInfo.percentageForDispute
          )
            .then(console.log)
            .catch(console.log)

        dispatch(
          addToast({
            type: 'success',
            title: t('actions.success'),
            content: t('custom-network:messages.refresh-the-page')
          })
        )

        setUpdatingNetwork(false)

        handleNetworkChange()
        loadData()
      })
      .catch((error) => {
        dispatch(
          addToast({
            type: 'danger',
            title: t('actions.failed'),
            content: t('custom-network:errors.failed-to-update-network', {
              error
            })
          })
        )

        setUpdatingNetwork(false)
        console.log(error)
      })
  }

  function handleCloseNetwork() {
    if (!network) return

    setIsClosing(true)

    BeproService.closeNetwork()
      .then(() => {
        return updateNetwork({
          githubLogin,
          isClosed: true,
          creator: currentAddress,
          networkAddress: network.networkAddress
        })
      })
      .then(() => {
        dispatch(
          addToast({
            type: 'success',
            title: t('actions.success'),
            content: t('custom-network:messages.network-closed')
          })
        )
      })
      .catch((error) => {
        dispatch(
          addToast({
            type: 'danger',
            title: t('actions.failed'),
            content: t('custom-network:errors.failed-to-close-network', {
              error
            })
          })
        )
      })
      .finally(() => {
        setIsClosing(false)
      })
  }

  useEffect(() => {
    if (!BeproService.isStarted || !network || !currentAddress || !githubLogin)
      return

    BeproService.isNetworkAbleToClose(network.networkAddress)
      .then((result) => {
        setIsAbleToClose(result && !network.isClosed)
      })
      .catch(console.log)

    isNetworkOwner(currentAddress, network.networkAddress)
      .then((result) => {
        if (!result) router.push(getURLWithNetwork('/account'))
        else {
          loadData()
          loadAmounts()
        }
      })
      .catch((error) => {
        console.log('Failed to verify network creator', error)

        router.push(getURLWithNetwork('/account'))
      })
  }, [BeproService.isStarted, network, currentAddress, githubLogin])

  useEffect(() => {
    const networkData = newInfo.network.data

    if (networkData.colors.data.primary) {
      const similarColors = []
      const colors = networkData.colors.data

      similarColors.push(
        ...isColorsSimilar({ label: 'text', code: colors.text }, [
          { label: 'primary', code: colors.primary },
          //{ label: 'secondary', code: colors.secondary },
          { label: 'background', code: colors.background },
          { label: 'shadow', code: colors.shadow }
        ])
      )

      similarColors.push(
        ...isColorsSimilar({ label: 'background', code: colors.background }, [
          { label: 'success', code: colors.success },
          { label: 'fail', code: colors.fail },
          { label: 'warning', code: colors.warning }
        ])
      )

      if (
        !isSameSet(new Set(similarColors), new Set(networkData.colors.similar))
      ) {
        const tmpInfo = Object.assign({}, newInfo)

        tmpInfo.network.data.colors.similar = similarColors

        setNewInfo(tmpInfo)
      }
    }

    const validation = [
      isValidRedeemTime,
      isValidDescription,
      isValidDisputeTime,
      isValidCouncilAmount,
      isValidPercentageForDispute,
      !newInfo.network.data.colors.similar.length
    ].every((condition) => condition)

    if (validation !== newInfo.validated) {
      const tmpInfo = Object.assign({}, newInfo)

      tmpInfo.validated = validation

      setNewInfo(tmpInfo)
    }
  }, [newInfo])

  return (
    <div>
      <style>{colorsToCSS(newInfo.network.data.colors.data)}</style>

      <ConnectWalletButton asModal={true} />

      <CustomContainer>
        <div className="row mt-5 pt-5 justify-content-center align-items-center">
          <div className="col-11">
            <div className="d-flex flex-row gap-20">
              <div className="d-flex flex-column justify-content-center">
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
                  onChange={handleNetworkDataChange}
                  description={
                    <>
                      {t('misc.upload')} <br />{' '}
                      {t(
                        'custom-network:steps.network-information.fields.logo-icon.label'
                      )}
                    </>
                  }
                />
              </div>

              <div className="d-flex flex-column justify-content-center">
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
                  onChange={handleNetworkDataChange}
                  description={`${t('misc.upload')} ${t(
                    'custom-network:steps.network-information.fields.full-logo.label'
                  )}`}
                  lg
                />
              </div>

              <div className="d-flex flex-column justify-content-center">
                <p className="h3 text-white mb-3 text-capitalize">
                  {showTextOrDefault(
                    network?.name,
                    t(
                      'custom-network:steps.network-information.fields.name.default'
                    )
                  )}
                </p>

                <p className="caption-small text-ligth-gray mb-1">
                  {t('custom-network:query-url')}
                </p>
                <p className="caption-small text-gray mb-3">
                  {urlWithoutProtocol(API)}/
                  <span className="text-primary">
                    {showTextOrDefault(
                      getQueryableText(network?.name || ''),
                      t(
                        'custom-network:steps.network-information.fields.name.default'
                      )
                    )}
                  </span>
                </p>

                <div className="d-flex flex-row">
                  <div className="d-flex flex-column mr-3">
                    <span className="text-ligth-gray mb-1 caption-small">
                      {t('misc.creation-date')}
                    </span>
                    <span className="text-gray caption-small">
                      {network?.createdAt
                        ? formatDate(network?.createdAt, '-')
                        : ''}
                    </span>
                  </div>

                  <Button
                    color="dark-gray"
                    disabled={!isAbleToClose || isClosing}
                    className="ml-2"
                    onClick={handleCloseNetwork}
                  >
                    {!isAbleToClose && <LockedIcon className="me-2" />}
                    <span>{t('custom-network:close-network')}</span>
                    {isClosing ? (
                      <span className="spinner-border spinner-border-xs ml-1" />
                    ) : (
                      ''
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-4">
                <AmountCard
                  title={t('custom-network:tokens-staked')}
                  description={t('custom-network:tokens-staked-description')}
                  currency="token"
                  amount={networkAmounts.tokenStaked}
                />
              </div>

              <div className="col-4">
                <AmountCard
                  title={t('custom-network:oracles-staked')}
                  description={t('custom-network:oracles-staked-description')}
                  currency="oracles"
                  amount={networkAmounts.oraclesStaked}
                />
              </div>

              <div className="col-4">
                <AmountCard
                  title={t('custom-network:tvl')}
                  description={t('custom-network:tvl-description')}
                  amount={
                    networkAmounts.tokenStaked + networkAmounts.oraclesStaked
                  }
                />
              </div>
            </div>

            <div className="row mx-0 mt-4 p-20 border-radius-8 bg-shadow">
              <span className="caption-medium text-white mb-4">
                {t('custom-network:network-settings')}
              </span>

              <div className="row mx-0 px-0 mb-3">
                <div className="col">
                  <label htmlFor="description" className="caption-small mb-2">
                    {t(
                      'custom-network:steps.network-information.fields.description.label'
                    )}
                  </label>

                  <textarea
                    name="description"
                    id="description"
                    placeholder={t(
                      'custom-network:steps.network-information.fields.description.placeholder'
                    )}
                    cols={30}
                    rows={5}
                    className={`form-control ${
                      isValidDescription ? '' : 'is-invalid'
                    }`}
                    value={newInfo.network.data.networkDescription}
                    onChange={(e) =>
                      handleNetworkDataChange({
                        label: 'networkDescription',
                        value: e.target.value
                      })
                    }
                  ></textarea>
                </div>
              </div>

              <RepositoriesList
                repositories={newInfo.repositories.data}
                onClick={handleCheckRepository}
              />

              <ThemeColors
                colors={newInfo.network.data.colors.data}
                similar={newInfo.network.data.colors.similar}
                setColor={changeColor}
              />

              <div className="row px-0 mt-3">
                <div className="col-3">
                  <InputNumber
                    classSymbol={`text-ligth-gray`}
                    label={t('custom-network:dispute-time')}
                    symbol={t('misc.seconds')}
                    max={DISPUTABLE_TIME_MAX}
                    description={t('custom-network:errors.dispute-time', {
                      min: DISPUTABLE_TIME_MIN,
                      max: formatNumberToCurrency(DISPUTABLE_TIME_MAX, 0)
                    })}
                    value={newInfo.disputeTime}
                    error={!isValidDisputeTime}
                    min={0}
                    placeholder={'0'}
                    thousandSeparator
                    decimalSeparator="."
                    decimalScale={18}
                    onValueChange={({ floatValue }) =>
                      handleInputChange('disputeTime', floatValue)
                    }
                  />
                </div>

                <div className="col-3">
                  <InputNumber
                    classSymbol={`text-ligth-gray`}
                    label={t('custom-network:percentage-for-dispute')}
                    max={DISPUTE_PERCENTAGE_MAX}
                    description={t(
                      'custom-network:errors.percentage-for-dispute',
                      { max: DISPUTE_PERCENTAGE_MAX }
                    )}
                    symbol="%"
                    value={newInfo.percentageForDispute}
                    error={!isValidPercentageForDispute}
                    placeholder={'0'}
                    thousandSeparator
                    decimalSeparator="."
                    decimalScale={18}
                    onValueChange={({ floatValue }) =>
                      handleInputChange('percentageForDispute', floatValue)
                    }
                  />
                </div>

                <div className="col-3">
                  <InputNumber
                    classSymbol={`text-ligth-gray`}
                    label={t('custom-network:redeem-time')}
                    max={REDEEM_TIME_MAX}
                    description={t('custom-network:errors.redeem-time', {
                      min: REDEEM_TIME_MIN,
                      max: REDEEM_TIME_MAX
                    })}
                    symbol="seconds"
                    value={newInfo.redeemTime}
                    error={!isValidRedeemTime}
                    min={0}
                    placeholder={'0'}
                    thousandSeparator
                    decimalSeparator="."
                    decimalScale={18}
                    onValueChange={({ floatValue }) =>
                      handleInputChange('redeemTime', floatValue)
                    }
                  />
                </div>

                <div className="col-3">
                  <InputNumber
                    classSymbol={`text-primary`}
                    label={t('custom-network:council-amount')}
                    symbol={t('$bepro')}
                    max={COUNCIL_AMOUNT_MAX}
                    description={t('custom-network:errors.council-amount', {
                      min: formatNumberToCurrency(COUNCIL_AMOUNT_MIN, 0),
                      max: formatNumberToCurrency(COUNCIL_AMOUNT_MAX, 0)
                    })}
                    value={newInfo.councilAmount}
                    error={!isValidCouncilAmount}
                    min={0}
                    placeholder={'0'}
                    thousandSeparator
                    decimalSeparator="."
                    decimalScale={18}
                    onValueChange={({ floatValue }) =>
                      handleInputChange('councilAmount', floatValue)
                    }
                  />
                </div>
              </div>
            </div>

            {(newInfo.validated && !network?.isClosed && (
              <div className="d-flex flex-row justify-content-center mt-3 mb-2">
                <Button onClick={handleSubmit} disabled={updatingNetwork}>
                  <span>{t('custom-network:save-settings')}</span>
                  {updatingNetwork ? (
                    <span className="spinner-border spinner-border-xs ml-1" />
                  ) : (
                    ''
                  )}
                </Button>
              </div>
            )) ||
              ''}
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
        'pull-request',
        'custom-network'
      ]))
    }
  }
}
