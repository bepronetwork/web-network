import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { ProgressBar } from 'react-bootstrap'
import { useContext, useEffect, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Step from '@components/step'
import Stepper from '@components/stepper'
import ColorInput from '@components/color-input'
import GithubInfo from '@components/github-info'
import ImageUploader from '@components/image-uploader'
import ConnectGithub from '@components/connect-github'
import CustomContainer from '@components/custom-container'
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
    state: { currentAddress, githubLogin, balance, oracles }
  } = useContext(ApplicationContext)

  const [currentStep, setCurrentStep] = useState(1)
  const [tokensLocked, setTokensLocked] = useState(0)
  const [steps, setSteps] = useState({
    lock: {
      validated: true
    },
    network: {
      validated: false,
      data: {
        logoIcon: {
          preview: '',
          raw: ''
        },
        fullLogo: {
          preview: '',
          raw: ''
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
    //BeproService.getTokensLockedByAddress(currentAddress).then(console.log)
  }, [currentAddress])

  useEffect(() => {
    // Validate Network informations
    const networkData = steps.network.data

    const networkValidated = [
      networkData.fullLogo.preview !== '',
      networkData.logoIcon.preview !== '',
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
    <div>
      <ConnectWalletButton asModal={true} />

      <CustomContainer>
        <div className="mt-5 pt-5">
          <Stepper>
            <LockBepro
              validated={steps.lock.validated}
              step={1}
              currentStep={currentStep}
              handleClick={() => handleChangeStep(1)}
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
              handleClick={() => handleChangeStep(2)}
            />

            <SelectRepositories
              repositories={steps.repositories.data}
              onClick={handleCheckRepository}
              githubLogin={githubLogin}
              validated={steps.repositories.validated}
              step={3}
              currentStep={currentStep}
              handleClick={() => handleChangeStep(3)}
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
function LockBepro({ validated, step, currentStep, handleClick, balance }) {
  return (
    <Step
      title="Network "
      index={step}
      activeStep={currentStep}
      validated={validated}
      handleClick={handleClick}
    >
      <div className="row mb-4">
        <span className="caption-small text-gray">
          To create a network you will nedd to lock 1M $BEPRO
        </span>
      </div>

      <div className="row mx-0 mb-4">
        <div className="col bg-dark-gray border-radius-8 p-4 text-center mr-3">
          <p className="caption-medium text-gray">
            <span className="text-primary">$BEPRO</span> available
          </p>
          <p className="h4 text-white">
            {formatNumberToCurrency(balance.beproAvailable || 0, {
              maximumFractionDigits: 18
            })}
          </p>
        </div>

        <div className="col bg-dark-gray border-radius-8 p-4 text-center">
          <p className="caption-medium text-gray">
            <span className="text-purple">ORACLES</span> available
          </p>
          <p className="h4 text-white">
            {formatNumberToCurrency(balance.oraclesAvailable || 0, {
              maximumFractionDigits: 18
            })}
          </p>
        </div>
      </div>

      <div className="row mx-0 mb-2">
        <ProgressBar variant="success" now={40} />
      </div>

      <div className="row mx-0">
        <div className="col p-0 text-center">
          <p className="h3 text-white mb-1">
            {formatNumberToCurrency(balance.tokensLocked || 0, {
              maximumFractionDigits: 18
            })}
          </p>
          <p className="caption-medium text-gray">
            <span className="text-primary">$BEPRO</span> locked
          </p>
        </div>
      </div>
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
  handleClick
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
      handleClick={handleClick}
    >
      <div className="d-flex gap-20 mb-5 align-items-center">
        <ImageUploader
          name="logoIcon"
          onChange={changedDataHandler}
          description={
            <>
              upload <br /> logo icon
            </>
          }
        />

        <ImageUploader
          name="fullLogo"
          onChange={changedDataHandler}
          description={
            <>
              upload <br /> full logo
            </>
          }
        />

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

      <div className="row mx-0 px-0">
        <div className="col">
          <label htmlFor="colors" className="caption-small mb-2">
            colors
          </label>

          <div className="row justify-space-between">
            {data.colors &&
              Object.entries(data.colors).map((color) => (
                <div className="col">
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
  handleClick
}) {
  return (
    <Step
      title="Select Repositories "
      index={step}
      activeStep={currentStep}
      validated={validated}
      handleClick={handleClick}
    >
      {(githubLogin && (
        <div className="row mb-4 justify-content-start repositories-list">
          {repositories.map((repository) => (
            <GithubInfo
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
