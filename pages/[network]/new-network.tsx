import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useContext, useEffect, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Stepper from '@components/stepper'
import CustomContainer from '@components/custom-container'
import ConnectWalletButton from '@components/connect-wallet-button'
import CreatingNetworkLoader from '@components/creating-network-loader'

import LockBeproStep from '@components/custom-network/lock-bepro-step'
import NetworkInformationStep from '@components/custom-network/network-information-step'
import SelectRepositoriesStep from '@components/custom-network/select-repositories-step'

import { addToast } from '@contexts/reducers/add-toast'
import { ApplicationContext } from '@contexts/application'

import { isSameSet } from '@helpers/array'
import { isColorsSimilar } from '@helpers/colors'
import { DefaultNetworkInformation } from '@helpers/custom-network'

import { BeproService } from '@services/bepro-service'

import useApi from '@x-hooks/use-api'
import useNetwork from '@x-hooks/use-network'
import useOctokit from '@x-hooks/use-octokit'
import { psReadAsText } from '@helpers/file-reader'

export default function NewNetwork() {
  const router = useRouter()
  const { createNetwork } = useApi()
  const { listUserRepos } = useOctokit()
  const { network, getURLWithNetwork, colorsToCSS, DefaultTheme } = useNetwork()

  const {
    dispatch,
    state: { currentAddress, githubLogin, balance, oracles, beproInit }
  } = useContext(ApplicationContext)

  const [currentStep, setCurrentStep] = useState(1)
  const [creatingNetwork, setCreatingNetwork] = useState(false)
  const [steps, setSteps] = useState(DefaultNetworkInformation)

  function changeColor(newColor) {
    const tmpSteps = Object.assign({}, steps)

    tmpSteps.network.data.colors.data[newColor.label] = newColor.value

    setSteps(tmpSteps)
  }

  function handleNetworkDataChange(newData) {
    const tmpSteps = Object.assign({}, steps)

    tmpSteps.network.data[newData.label] = newData.value

    setSteps(tmpSteps)
  }

  function handleCheckRepository(repositoryName) {
    const tmpSteps = Object.assign({}, steps)

    const repositoryIndex = tmpSteps.repositories.data.findIndex(
      (repo) => repo.name === repositoryName
    )

    tmpSteps.repositories.data[repositoryIndex].checked =
      !tmpSteps.repositories.data[repositoryIndex].checked

    setSteps(tmpSteps)
  }

  function handleCheckPermission(check) {
    const tmpSteps = Object.assign({}, steps)

    tmpSteps.repositories.permission = check

    setSteps(tmpSteps)
  }

  function handleLockDataChange(newData) {
    const tmpSteps = Object.assign({}, steps)

    tmpSteps.lock[newData.label] = newData.value

    setSteps(tmpSteps)
  }

  function handleChangeStep(stepToGo: number) {
    const stepsNames = {
      1: 'lock',
      2: 'network',
      3: 'repositories'
    }

    let canGo = false

    if (stepToGo !== currentStep) {
      if (stepToGo < currentStep) canGo = true
      else if (steps[stepsNames[stepToGo - 1]].validated) canGo = true
    }

    if (canGo) setCurrentStep(stepToGo)
  }

  function handleCreateNetwork() {
    if (!githubLogin || !currentAddress) return

    setCreatingNetwork(true)

    BeproService.createNetwork()
      .then((receipt) => {
        BeproService.getNetworkAdressByCreator(currentAddress).then(
          async (networkAddress) => {
            const networkData = steps.network.data
            const repositoriesData = steps.repositories

            const json = {
              name: networkData.displayName.data,
              description: networkData.networkDescription,
              colors: JSON.stringify(networkData.colors.data),
              logoIcon: await psReadAsText(networkData.logoIcon.raw),
              fullLogo: await psReadAsText(networkData.fullLogo.raw),
              repositories: JSON.stringify(
                repositoriesData.data
                  .filter((repo) => repo.checked)
                  .map(({ name, fullName }) => ({ name, fullName }))
              ),
              botPermission: repositoriesData.permission,
              creator: currentAddress,
              githubLogin,
              networkAddress
            }

            createNetwork(json).then((result) => {
              router.push(
                getURLWithNetwork('/account/my-network', { network: json.name })
              )
              
              setCreatingNetwork(false)
            })
          }
        )
      })
      .catch((error) => {
        dispatch(
          addToast({
            type: 'danger',
            title: 'Fail',
            content: `Fail to create network ${error}`
          })
        )

        setCreatingNetwork(false)
        console.log(error)
      })
  }

  useEffect(() => {
    if (!Object.keys(steps.network.data.colors.data).length && network) {
      const tmpSteps = Object.assign({}, steps)

      tmpSteps.network.data.colors.data = network.colors || DefaultTheme()

      setSteps(tmpSteps)
    }
  }, [network])

  useEffect(() => {
    if (githubLogin)
      listUserRepos(githubLogin).then(({ data }) => {
        const repositories = data.items.map((repo) => ({
          checked: false,
          name: repo.name,
          fullName: repo.full_name
        }))

        const tmpSteps = Object.assign({}, steps)

        tmpSteps.repositories.data = repositories

        setSteps(tmpSteps)
      })
  }, [githubLogin])

  useEffect(() => {
    if (currentAddress && beproInit) {
      BeproService.getTokensLockedByAddress(currentAddress)
        .then((value) => {
          handleLockDataChange({ label: 'amountLocked', value })
        })
        .catch(console.log)

      handleLockDataChange({
        label: 'amountNeeded',
        value: BeproService.operatorAmount
      })
    }
  }, [currentAddress, beproInit])

  useEffect(() => {
    //Validate Locked Tokens
    const lockData = steps.lock

    const lockValidated = lockData.amountLocked >= BeproService.operatorAmount

    if (lockValidated !== steps.lock.validated) {
      const tmpSteps = Object.assign({}, steps)

      tmpSteps.lock.validated = lockValidated

      setSteps(tmpSteps)
    }

    // Validate Network informations
    const networkData = steps.network.data

    const networkValidated = [
      networkData.fullLogo.preview !== '',
      networkData.logoIcon.preview !== '',
      networkData.fullLogo.raw?.type?.includes('image/svg'),
      networkData.logoIcon.raw?.type?.includes('image/svg'),
      networkData.displayName.validated,
      networkData.networkDescription.trim() !== '',
      !networkData.colors.similar.length // All colors should be different
    ].every((condition) => condition === true)

    if (networkValidated !== steps.network.validated) {
      const tmpSteps = Object.assign({}, steps)

      tmpSteps.network.validated = networkValidated

      setSteps(tmpSteps)
    }

    // Validate Repositories
    const repositoriesData = steps.repositories.data
    const repositoriesValidated =
      steps.repositories.permission &&
      repositoriesData.some((repository) => repository.checked)

    if (repositoriesValidated !== steps.repositories.validated) {
      const tmpSteps = Object.assign({}, steps)

      tmpSteps.repositories.validated = repositoriesValidated

      setSteps(tmpSteps)
    }
  }, [steps])

  useEffect(() => {
    const networkData = steps.network.data

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
        const tmpSteps = Object.assign({}, steps)

        tmpSteps.network.data.colors.similar = similarColors

        setSteps(tmpSteps)
      }
    }
  }, [steps])

  return (
    <div className="new-network">
      <style>{colorsToCSS(steps.network.data.colors.data)}</style>
      <ConnectWalletButton asModal={true} />

      {(creatingNetwork && <CreatingNetworkLoader />) || ''}

      <CustomContainer>
        <div className="mt-5 pt-5">
          <Stepper>
            <LockBeproStep
              data={steps.lock}
              step={1}
              currentStep={currentStep}
              handleChangeStep={handleChangeStep}
              handleChange={handleLockDataChange}
              balance={{
                beproAvailable: balance.bepro,
                oraclesAvailable:
                  +oracles.tokensLocked - oracles.delegatedToOthers,
                tokensLocked: oracles.tokensLocked
              }}
            />

            <NetworkInformationStep
              data={steps.network.data}
              setColor={changeColor}
              changedDataHandler={handleNetworkDataChange}
              validated={steps.network.validated}
              step={2}
              currentStep={currentStep}
              handleChangeStep={handleChangeStep}
            />

            <SelectRepositoriesStep
              data={steps.repositories}
              onClick={handleCheckRepository}
              githubLogin={githubLogin}
              validated={steps.repositories.validated}
              step={3}
              currentStep={currentStep}
              handleChangeStep={handleChangeStep}
              handleFinish={handleCreateNetwork}
              handleCheckPermission={handleCheckPermission}
            />
          </Stepper>
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
        'bounty',
        'connect-wallet-button'
      ]))
    }
  }
}