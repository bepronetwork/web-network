import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { ProgressBar } from 'react-bootstrap'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Step from '@components/step'
import Stepper from '@components/stepper'
import ImageUploader from '@components/image-uploader'
import CustomContainer from '@components/custom-container'
import ConnectWalletButton from '@components/connect-wallet-button'
import ColorInput from '@components/color-input'

import { ThemeColors } from '@interfaces/network'

import useNetwork from '@x-hooks/use-network'
import GithubInfo from '@components/github-info'

export default function NewNetwork() {
  const { network } = useNetwork()
  const [colors, setColors] = useState<ThemeColors>()

  useEffect(() => {
    if (!colors && network) setColors(network.colors)
  }, [network])

  return (
    <div>
      <ConnectWalletButton asModal={true} />

      <CustomContainer>
        <div className="mt-5 pt-5">
          <Stepper>
            <LockBepro />

            <NetworkInformation colors={colors} setColors={setColors} />

            <SelectRepositories />
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
function LockBepro() {
  return (
    <Step title="Network " index={1} activeStep={1}>
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
          <p className="h4 text-white">304,403</p>
        </div>

        <div className="col bg-dark-gray border-radius-8 p-4 text-center">
          <p className="caption-medium text-gray">
            <span className="text-purple">ORACLES</span> available
          </p>
          <p className="h4 text-white">304,403</p>
        </div>
      </div>

      <div className="row mx-0 mb-2">
        <ProgressBar variant="success" now={40} />
      </div>

      <div className="row mx-0">
        <div className="col p-0 text-center">
          <p className="h3 text-white mb-1">304,403</p>
          <p className="caption-medium text-gray">
            <span className="text-primary">$BEPRO</span> locked
          </p>
        </div>
      </div>
    </Step>
  )
}

function NetworkInformation({ colors, setColors }) {
  return (
    <Step title="Network Information" index={2} activeStep={2}>
      <div className="d-flex gap-20 mb-5 align-items-center">
        <ImageUploader
          name="logo-icon"
          description={
            <>
              upload <br /> logo icon
            </>
          }
        />

        <ImageUploader
          name="full-logo"
          description={
            <>
              upload <br /> full logo
            </>
          }
        />

        <div className="col ml-2">
          <p className="h3 text-white mb-3">Network name</p>
          <p className="caption-small text-ligth-gray mb-2">
            temporary query url
          </p>
          <p className="caption-small text-gray">
            development.bepro.network/
            <span className="text-primary">network-name</span>
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
          ></textarea>
        </div>
      </div>

      <div className="row mx-0 px-0">
        <div className="col">
          <label htmlFor="colors" className="caption-small mb-2">
            colors
          </label>

          <div className="row justify-space-between">
            {colors &&
              Object.entries(colors).map((color) => (
                <div className="col">
                  <ColorInput label={color[0]} value={color[1]} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </Step>
  )
}

function SelectRepositories() {
  return (
    <Step title="Select Repositories " index={3} activeStep={3}>
      <div className="row mb-4 justify-content-start repositories-list">
        <GithubInfo label="repository-1" variant="repository" parent="list" />
        <GithubInfo label="bigger-name-repository-1" variant="repository" parent="list" />
        <GithubInfo label="repository-1" variant="repository" parent="list" />
        <GithubInfo label="reposry-1" variant="repository" parent="list" />
        <GithubInfo label="another-repository-1" variant="repository" parent="list" />
        <GithubInfo label="repository-1" variant="repository" parent="list" />
        <GithubInfo label="repository-1" variant="repository" parent="list" />
        <GithubInfo label="reposczxcxitory-1" variant="repository" parent="list" />
        <GithubInfo label="repositoczxcry-1" variant="repository" parent="list" />
        <GithubInfo label="repository-1" variant="repository" parent="list" />
        <GithubInfo label="repository-1" variant="repository" parent="list" />
        <GithubInfo label="repositoryzxcz-1" variant="repository" parent="list" />
        <GithubInfo label="repository-1czcx" variant="repository" parent="list" />
        <GithubInfo label="repository-1" variant="repository" parent="list" />
        <GithubInfo label="repository-1" variant="repository" parent="list" />
        <GithubInfo label="repository-1" variant="repository" parent="list" />
        <GithubInfo label="repositoczcxry-1" variant="repository" parent="list" />
        <GithubInfo label="rep-1" variant="repository" parent="list" />
      </div>
    </Step>
  )
}