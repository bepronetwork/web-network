import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useContext, useEffect, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

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
import { getQueryableText } from '@helpers/string'
import { psReadAsText } from '@helpers/file-reader'
import { formatNumberToCurrency } from '@helpers/formatNumber'
import { DefaultNetworkInformation } from '@helpers/custom-network'

import { BeproService } from '@services/bepro-service'

import useApi from '@x-hooks/use-api'
import useOctokit from '@x-hooks/use-octokit'
import useNetwork from '@x-hooks/use-network'

import {
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

  const router = useRouter()

  const { listUserRepos } = useOctokit()
  const { searchRepositories, updateNetwork } = useApi()
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
          await BeproService.setRedeemTime(newInfo.redeemTime).then(console.log).catch(console.log)

        if (currentNetworkParameters.disputeTime !== newInfo.disputeTime) 
          await BeproService.setDisputeTime(newInfo.disputeTime).then(console.log).catch(console.log)

        if (currentNetworkParameters.councilAmount !== newInfo.councilAmount) 
          await BeproService.setCouncilAmount(newInfo.councilAmount).then(console.log).catch(console.log)

        if (currentNetworkParameters.percentageForDispute !== newInfo.percentageForDispute) 
          await BeproService.setPercentageForDispute(newInfo.percentageForDispute).then(console.log).catch(console.log)
        

        dispatch(
          addToast({
            type: 'success',
            title: 'Success',
            content: `Refresh the page for the changes to take effect.`
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
            title: 'Fail',
            content: `Fail to create network ${error}`
          })
        )

        setUpdatingNetwork(false)
        console.log(error)
      })
  }

  useEffect(() => {
    if (!network || !currentAddress || !githubLogin) return

    BeproService.networkFactory
      .getNetworkByAddress(currentAddress)
      .then((result) => {
        if (result.toLowerCase() !== network.networkAddress.toLowerCase())
          router.push(getURLWithNetwork('/account'))
        else {
          loadData()
          loadAmounts()
        }
      })
      .catch((error) => {
        console.log('Failed to verify network creator', error)

        router.push(getURLWithNetwork('/account'))
      })
  }, [network, currentAddress, githubLogin])

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
                      upload <br /> logo icon
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
                  description="upload full logo"
                  lg
                />
              </div>

              <div className="d-flex flex-column justify-content-center">
                <p className="h3 text-white mb-3 text-capitalize">
                  {showTextOrDefault(network?.name, 'Network name')}
                </p>

                <p className="caption-small text-ligth-gray mb-1">query url</p>
                <p className="caption-small text-gray mb-3">
                  development.bepro.network/
                  <span className="text-primary">
                    {showTextOrDefault(
                      getQueryableText(network?.name || ''),
                      'network-name'
                    )}
                  </span>
                </p>

                <div className="d-flex flex-row">
                  <div className="d-flex flex-column mr-3">
                    <span className="text-ligth-gray mb-1 caption-small">
                      creation date
                    </span>
                    <span className="text-gray caption-small">
                      {network?.createdAt
                        ? formatDate(network?.createdAt, '-')
                        : ''}
                    </span>
                  </div>

                  <Button color="dark-gray" disabled outline className="ml-2">
                    Close Network
                  </Button>
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-4">
                <AmountCard
                  title="$TOKEN staked"
                  description="The amount of tokens locked into bounties to be paid"
                  currency="token"
                  amount={networkAmounts.tokenStaked}
                />
              </div>

              <div className="col-4">
                <AmountCard
                  title="oracles staked"
                  description="The amount of tokens locked by users to curate the network"
                  currency="oracles"
                  amount={networkAmounts.oraclesStaked}
                />
              </div>

              <div className="col-4">
                <AmountCard
                  title="TVL"
                  description="Total locked value"
                  amount={
                    networkAmounts.tokenStaked + networkAmounts.oraclesStaked
                  }
                />
              </div>
            </div>

            <div className="row mx-0 mt-4 p-20 border-radius-8 bg-shadow">
              <span className="caption-medium text-white mb-4">
                Network Settings
              </span>

              <div className="row mx-0 px-0 mb-3">
                <div className="col">
                  <label htmlFor="description" className="caption-small mb-2">
                    network description
                  </label>

                  <textarea
                    name="description"
                    id="description"
                    placeholder="Type a description..."
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
                    label="Dispute time"
                    symbol="seconds"
                    max={DISPUTABLE_TIME_MAX}
                    description={`The time that proposals can be disputed. Min. ${DISPUTABLE_TIME_MIN} and Max. ${formatNumberToCurrency(
                      DISPUTABLE_TIME_MAX,
                      0
                    )} seconds.`}
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
                    label="Percentage for dispute"
                    max={DISPUTE_PERCENTAGE_MAX}
                    description={`Percentage needed for a proposal to be disputed by the community. Max. ${DISPUTE_PERCENTAGE_MAX}%.`}
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
                    label="Redeem time"
                    max={REDEEM_TIME_MAX}
                    description={`The time after a bounty creation that it can be cancelled. Min. ${REDEEM_TIME_MIN} and Max. ${formatNumberToCurrency(
                      REDEEM_TIME_MAX,
                      0
                    )} seconds.`}
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
                    label="council amount"
                    symbol="$BEPRO"
                    max={COUNCIL_AMOUNT_MAX}
                    description={`The amount of $BEPRO locked needed to be a council member. Min. ${formatNumberToCurrency(
                      COUNCIL_AMOUNT_MIN,
                      0
                    )} and Max. ${formatNumberToCurrency(
                      COUNCIL_AMOUNT_MAX,
                      0
                    )}.`}
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

            {(newInfo.validated && (
              <div className="d-flex flex-row justify-content-center mt-3 mb-2">
                <Button onClick={handleSubmit} disabled={updatingNetwork}>
                  <span>Save Settings</span>
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
        'pull-request'
      ]))
    }
  }
}
