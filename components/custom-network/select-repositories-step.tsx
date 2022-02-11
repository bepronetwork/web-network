import { FormCheck } from 'react-bootstrap'

import Step from '@components/step'
import GithubInfo from '@components/github-info'
import ConnectGithub from '@components/connect-github'

export default function SelectRepositoriesStep({
  data,
  step,
  onClick,
  validated,
  githubLogin,
  currentStep,
  handleFinish,
  handleChangeStep,
  handleCheckPermission
}) {
  function handleCheck(e) {
    handleCheckPermission(e.target.checked)
  }

  return (
    <Step
      title="Add Repositories"
      index={step}
      activeStep={currentStep}
      validated={validated}
      handleClick={handleChangeStep}
      finishLabel="Create Network"
      handleFinish={handleFinish}
    >
      {(githubLogin && (
        <div>
          <div className="row mx-0 mb-4 justify-content-start repositories-list">
            <span className="caption-small text-gray px-0">Repositories</span>

            {data.data.map((repository) => (
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

          <span className="caption-small text-gray px-0 mt-3">Bepro-bot</span>

          <div className="d-flex align-items-center p-small text-white px-0 m-0 p-0">
            <FormCheck
              className="form-control-lg px-0 pb-0 mr-1"
              type="checkbox"
              value={data.permission}
              onChange={handleCheck}
            />
            <span>Give access to the bepro-bot as an org member.</span>
          </div>

          <p className="p-small text-gray-70 px-0">
            You need to accept this so the bot can interact with the
            repositories.
          </p>
        </div>
      )) || (
        <div className="pt-3">
          <ConnectGithub />
        </div>
      )}
    </Step>
  )
}
