import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { ProgressBar } from 'react-bootstrap'
import { useContext, useEffect, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import LockedIcon from '@assets/icons/locked-icon'
import ArrowRightLine from '@assets/icons/arrow-right-line'

import Step from '@components/step'
import Button from '@components/button'
import Stepper from '@components/stepper'
import ColorInput from '@components/color-input'
import GithubInfo from '@components/github-info'
import InputNumber from '@components/input-number'
import ImageUploader from '@components/image-uploader'
import ConnectGithub from '@components/connect-github'
import CustomContainer from '@components/custom-container'
import UnlockBeproModal from '@components/unlock-bepro-modal'
import ConnectWalletButton from '@components/connect-wallet-button'

import { ApplicationContext } from '@contexts/application'

import { getQueryableText } from '@helpers/string'
import { formatNumberToCurrency } from '@helpers/formatNumber'

import { BeproService } from '@services/bepro-service'

import useNetwork from '@x-hooks/use-network'
import useOctokit from '@x-hooks/use-octokit'

export default function NewNetwork() {
  const { network } = useNetwork()
  const { listUserRepos } = useOctokit()

  const {
    state: { currentAddress, githubLogin, balance, oracles, beproInit }
  } = useContext(ApplicationContext)

  const [currentStep, setCurrentStep] = useState(1)
  const [steps, setSteps] = useState({
    lock: {
      validated: false,
      amount: 0,
      amountLocked: 0,
      amountNeeded: 0
    },
    network: {
      validated: false,
      data: {
        logoIcon: {
          preview: '',
          raw: undefined as File
        },
        fullLogo: {
          preview: '',
          raw: undefined as File
        },
        displayName: '',
        networkDescription: '',
        colors: {}
      }
    },
    repositories: {
      validated: false,
      data: []
    }
  })

  function changeColor(newColor) {
    const tmpSteps = Object.assign({}, steps)

    tmpSteps.network.data.colors[newColor.label] = newColor.value

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
    BeproService.createNetwork().then(console.log).catch(console.log)
  }

  useEffect(() => {
    if (!Object.keys(steps.network.data.colors).length && network) {
      const tmpSteps = Object.assign({}, steps)

      tmpSteps.network.data.colors = network.colors

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
    //BeproService.networkFactory.getAmountOfNetworksForked().then(result => console.log('getAmountOfNetworksForked', result)).catch(console.log)
    //BeproService.networkFactory.getNetworkById(0).then(result => console.log('getNetworkById', result)).catch(console.log)
    //BeproService.networkFactory.getNetworkByAddress(BeproService.address).then(result => console.log('getNetworkByAddress', result)).catch(console.log)

    //BeproService.networkFactory.contract.methods.networks(3).call().then(result => console.log('networksArray', result)).catch(console.log)

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
      networkData.displayName.trim() !== '',
      networkData.networkDescription.trim() !== '',
      new Set(
        Object.entries(networkData.colors).map((color) =>
          String(color[1]).toUpperCase()
        )
      ).size === Object.keys(networkData.colors).length // All colors should be different
    ].every((condition) => condition === true)

    if (networkValidated !== steps.network.validated) {
      const tmpSteps = Object.assign({}, steps)

      tmpSteps.network.validated = networkValidated

      setSteps(tmpSteps)
    }

    // Validate Repositories
    const repositoriesData = steps.repositories.data
    const repositoriesValidated = repositoriesData.some(
      (repository) => repository.checked
    )

    if (repositoriesValidated !== steps.repositories.validated) {
      const tmpSteps = Object.assign({}, steps)

      tmpSteps.repositories.validated = repositoriesValidated

      setSteps(tmpSteps)
    }
  }, [steps])

  return (
    <div className="new-network">
      <ConnectWalletButton asModal={true} />

      <CustomContainer>
        <div className="mt-5 pt-5">
          <Stepper>
            <LockBepro
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

            <NetworkInformation
              data={steps.network.data}
              setColor={changeColor}
              changedDataHandler={handleNetworkDataChange}
              validated={steps.network.validated}
              step={2}
              currentStep={currentStep}
              handleChangeStep={handleChangeStep}
            />

            <SelectRepositories
              repositories={steps.repositories.data}
              onClick={handleCheckRepository}
              githubLogin={githubLogin}
              validated={steps.repositories.validated}
              step={3}
              currentStep={currentStep}
              handleChangeStep={handleChangeStep}
              handleFinish={handleCreateNetwork}
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

// Create Network flow steps
function LockBepro({
  data,
  step,
  currentStep,
  handleChangeStep,
  balance,
  handleChange
}) {
  const [isLocking, setIsLocking] = useState(false)
  const [showUnlockBepro, setShowUnlockBepro] = useState(false)

  const lockedPercent =
    ((data.amountLocked || 0) / (data.amountNeeded || 0)) * 100
  const lockingPercent = ((data.amount || 0) / (data.amountNeeded || 0)) * 100
  const maxPercent = 100 - lockedPercent
  const maxValue = Math.min(
    balance.beproAvailable,
    data.amountNeeded - data.amountLocked
  )
  const textAmountClass =
    data.amount > balance.beproAvailable ? 'text-danger' : 'text-primary'
  const amountsClass = data.amount > maxValue ? 'danger' : 'success'

  function handleLock() {
    setIsLocking(true)

    BeproService.networkFactory
      .approveSettlerERC20Token()
      .then((result) => {
        BeproService.networkFactory
          .lock(data.amount)
          .then(() =>
            handleChange({ label: 'amountLocked', value: data.amount })
          )
          .catch(console.log)
          .finally(() => setIsLocking(false))
      })
      .catch(() => setIsLocking(false))
  }

  function handleUnLock() {
    BeproService.networkFactory.unlock().then(console.log).catch(console.log)
  }

  function handleShowUnlockModal() {
    setShowUnlockBepro(true)
  }

  function handleCloseUnlockModal() {
    setShowUnlockBepro(false)
  }

  return (
    <Step
      title="Network "
      index={step}
      activeStep={currentStep}
      validated={data.validated}
      handleClick={handleChangeStep}
    >
      <div className="row mb-4">
        <span className="caption-small text-gray">
          To create a network you will nedd to lock 1M $BEPRO
        </span>
      </div>

      <div className="row mx-0 mb-4">
        <div className="col mr-3">
          <div className="row">
            <div className="col px-0">
              <div className="row mb-2">
                <label htmlFor="" className="caption-medium text-gray">
                  <span className="text-primary">$BEPRO</span> amount
                </label>
              </div>

              <div className="row mx-0 bg-dark-gray border-radius-8 amount-input">
                <InputNumber
                  classSymbol={`text-primary`}
                  max={maxValue}
                  value={data.amount}
                  disabled={data.amountLocked >= data.amountNeeded}
                  setMaxValue={() =>
                    handleChange({ label: 'amount', value: maxValue })
                  }
                  min={0}
                  placeholder={'0'}
                  thousandSeparator
                  decimalSeparator="."
                  decimalScale={18}
                  onValueChange={(params) =>
                    handleChange({ label: 'amount', value: params.floatValue })
                  }
                />

                <div className="d-flex caption-small justify-content-between align-items-center p-20">
                  <span className="text-ligth-gray">
                    <span className="text-primary">$BEPRO</span> available
                  </span>

                  <div className="d-flex align-items-center">
                    <span className="text-gray">
                      {formatNumberToCurrency(balance.beproAvailable || 0, {
                        maximumFractionDigits: 18
                      })}
                    </span>

                    {data.amount > 0 && (
                      <>
                        <span
                          className={`${textAmountClass} ml-1 d-flex align-items-center`}
                        >
                          <ArrowRightLine />
                        </span>

                        <span className={`${textAmountClass} ml-1`}>
                          {formatNumberToCurrency(
                            parseFloat(balance.beproAvailable) -
                              parseFloat(data.amount)
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {balance.oraclesAvailable > 0 && (
                <>
                  <div className="row mt-4">
                    <p className="caption-small text-gray">
                      unlock <span className="text-primary">$BEPRO</span> by
                      giving away <span className="text-purple">oracles</span>
                    </p>
                  </div>

                  <div className="row mt-2 bg-dark-gray bg-dark-hover cursor-pointer border-radius-8 caption-small p-20" onClick={handleShowUnlockModal}>
                    <div className="d-flex justify-content-between px-0">
                      <span className="text-ligth-gray">
                        <span className="text-purple">ORACLES</span> available
                      </span>

                      <span className="text-gray">
                        {formatNumberToCurrency(balance.oraclesAvailable || 0, {
                          maximumFractionDigits: 18
                        })}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col bg-dark-gray border-radius-8 p-20">
          <p className="caption-medium text-gray mb-4">
            <span className="text-primary">$BEPRO</span> locked
          </p>

          <div className="d-flex justify-content-between caption-large mb-3">
            <div className="d-flex align-items-center">
              <span
                className={`text-${
                  (lockedPercent >= 100 && 'success') || 'white'
                } mr-1`}
              >
                {formatNumberToCurrency(data.amountLocked || 0, {
                  maximumFractionDigits: 18
                })}
              </span>

              {data.amount > 0 && (
                <div className={`text-${amountsClass}`}>
                  <ArrowRightLine />

                  <span className="ml-1">
                    {formatNumberToCurrency(
                      parseFloat(data.amountLocked) + parseFloat(data.amount)
                    )}
                  </span>
                </div>
              )}
            </div>

            <span
              className={`text-${
                (lockedPercent >= 100 && 'success') || 'gray'
              }`}
            >
              {(lockedPercent >= 100 && 'full') ||
                formatNumberToCurrency(data.amountNeeded || 0, {
                  maximumFractionDigits: 18
                })}
            </span>
          </div>

          <div className="row justify-content-between caption-large mb-3">
            <ProgressBar>
              <ProgressBar
                variant={amountsClass}
                now={lockingPercent > maxPercent ? 100 : lockedPercent}
                isChild
              />

              <ProgressBar
                min={0}
                now={lockingPercent > maxPercent ? 0 : lockingPercent}
                isChild
              />
            </ProgressBar>
          </div>

          <div className="d-flex align-items-center caption-large text-white">
            <span
              className={`text-${
                (lockedPercent >= 100 && 'success') || 'white'
              } mr-1`}
            >
              {formatNumberToCurrency(lockedPercent, {
                maximumFractionDigits: 2
              })}
              %
            </span>

            {data.amount > 0 && (
              <div className={`text-${amountsClass}`}>
                <ArrowRightLine />

                <span className="ml-1">
                  {formatNumberToCurrency(lockingPercent + lockedPercent, {
                    maximumFractionDigits: 2
                  })}
                  %
                </span>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-center mt-4 pt-3">
            <Button
              disabled={
                !(data.amount > 0) ||
                lockedPercent >= 100 ||
                data.amount > maxValue ||
                isLocking
              }
              onClick={() => handleLock()}
            >
              {!isLocking &&
                (!(data.amount > 0) ||
                  lockedPercent >= 100 ||
                  data.amount > maxValue) && (
                  <LockedIcon width={12} height={12} className="mr-1" />
                )}
              <span>lock $bepro</span>
              {isLocking ? (
                <span className="spinner-border spinner-border-xs ml-1" />
              ) : (
                ''
              )}
            </Button>

            <Button onClick={handleUnLock}>Unlock</Button>
          </div>
        </div>
      </div>

      <UnlockBeproModal show={showUnlockBepro} onCloseClick={handleCloseUnlockModal} />
    </Step>
  )
}

function NetworkInformation({
  data,
  setColor,
  changedDataHandler,
  validated,
  step,
  currentStep,
  handleChangeStep
}) {
  function showTextOrDefault(text: string, defaultText: string) {
    return text.trim() === '' ? defaultText : text
  }

  return (
    <Step
      title="Network Information"
      index={step}
      activeStep={currentStep}
      validated={validated}
      handleClick={handleChangeStep}
    >
      <span className="caption-small text-gray mb-4">
        You can change this information later in your Network Settings page.
      </span>

      <div className="d-flex gap-20 mb-5 align-items-center">
        <div className="d-flex flex-column">
          <div className="d-flex gap-20">
            <ImageUploader
              name="logoIcon"
              error={
                data.logoIcon.raw &&
                !data.logoIcon.raw?.type?.includes('image/svg')
              }
              onChange={changedDataHandler}
              description={
                <>
                  upload <br /> logo icon
                </>
              }
            />

            <ImageUploader
              name="fullLogo"
              error={
                data.fullLogo.raw &&
                !data.fullLogo.raw?.type?.includes('image/svg')
              }
              onChange={changedDataHandler}
              description="upload full logo"
              lg
            />
          </div>

          <p className="p-small text-gray mb-0 mt-2">
            The logos must be in .svg format
          </p>
        </div>

        <div className="col ml-2">
          <p className="h3 text-white mb-3">
            {showTextOrDefault(data.displayName, 'Network name')}
          </p>
          <p className="caption-small text-ligth-gray mb-2">
            temporary query url
          </p>
          <p className="caption-small text-gray">
            development.bepro.network/
            <span className="text-primary">
              {showTextOrDefault(
                getQueryableText(data.displayName),
                'network-name'
              )}
            </span>
          </p>
        </div>
      </div>

      <div className="row mx-0 px-0 mb-3">
        <div className="col">
          <label htmlFor="display-name" className="caption-small mb-2">
            display name
          </label>

          <input
            type="text"
            name="display-name"
            id="display-name"
            placeholder="Network Name"
            className="form-control"
            value={data.displayName}
            onChange={(e) =>
              changedDataHandler({
                label: 'displayName',
                value: e.target.value
              })
            }
          />

          <p className="p-small text-gray opacity-75 mt-2 mb-0">
            This will be your network name, it also affects your query URL.
          </p>
        </div>
      </div>

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
            className="form-control"
            value={data.networkDescription}
            onChange={(e) =>
              changedDataHandler({
                label: 'networkDescription',
                value: e.target.value
              })
            }
          ></textarea>
        </div>
      </div>

      <div className="row mx-0 px-0 mb-3">
        <div className="col">
          <label htmlFor="colors" className="caption-small mb-2">
            colors
          </label>

          <div className="row justify-space-between">
            {data.colors &&
              Object.entries(data.colors).map((color) => (
                <div className="col" key={color[0]}>
                  <ColorInput
                    label={color[0]}
                    value={color[1]}
                    onChange={setColor}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </Step>
  )
}

function SelectRepositories({
  repositories,
  onClick,
  githubLogin,
  validated,
  step,
  currentStep,
  handleChangeStep,
  handleFinish
}) {
  return (
    <Step
      title="Select Repositories "
      index={step}
      activeStep={currentStep}
      validated={validated}
      handleClick={handleChangeStep}
      finishLabel="Create Network"
      handleFinish={handleFinish}
    >
      {(githubLogin && (
        <div className="row mb-4 justify-content-start repositories-list">
          {repositories.map((repository) => (
            <GithubInfo
              key={repository.name}
              label={repository.name}
              active={repository.checked}
              onClick={() => onClick(repository.name)}
              variant="repository"
              parent="list"
            />
          ))}
        </div>
      )) || (
        <div className="pt-3">
          <ConnectGithub />
        </div>
      )}
    </Step>
  )
}
