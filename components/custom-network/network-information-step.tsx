import Step from '@components/step'
import ImageUploader from '@components/image-uploader'
import ThemeColors from '@components/custom-network/theme-colors'

import { getQueryableText } from '@helpers/string'

import useNetwork from '@x-hooks/use-network'

export default function NetworkInformationStep({
  data,
  step,
  setColor,
  validated,
  currentStep,
  handleChangeStep,
  changedDataHandler
}) {
  const { networkExists } = useNetwork()

  function showTextOrDefault(text: string, defaultText: string) {
    return text.trim() === '' ? defaultText : text
  }

  function handleInputChange(e) {
    changedDataHandler({
      label: 'displayName',
      value: {
        data: e.target.value,
        validated: undefined
      }
    })
  }

  async function handleBlur(e) {
    const name = e.target.value
    const exists =
      name.trim() !== ''
        ? name.toLowerCase().includes('bepro')
          ? false
          : !(await networkExists(name))
        : undefined

    changedDataHandler({
      label: 'displayName',
      value: {
        data: name,
        validated: exists
      }
    })
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
            {showTextOrDefault(data.displayName.data, 'Network name')}
          </p>
          <p className="caption-small text-ligth-gray mb-2">
            temporary query url
          </p>
          <p className="caption-small text-gray">
            development.bepro.network/
            <span className="text-primary">
              {showTextOrDefault(
                getQueryableText(data.displayName.data),
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
            className={`form-control ${
              data.displayName.validated !== undefined
                ? (data.displayName.validated === true && 'is-valid') ||
                  'is-invalid'
                : ''
            }`}
            value={data.displayName.data}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />

          {(data.displayName.validated === undefined && (
            <p className="p-small text-gray opacity-75 mt-2 mb-0">
              This will be your network name, it also affects your query URL.
            </p>
          )) || (
            <>
              <p className="valid-feedback p-small mt-2 mb-0">
                This network name is available.
              </p>
              <p className="invalid-feedback p-small mt-2 mb-0">
                This network name is not available. Please pick a different name
              </p>
            </>
          )}
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
          <ThemeColors
            colors={data.colors.data}
            similar={data.colors.similar}
            setColor={setColor}
          />
        </div>
      </div>
    </Step>
  )
}
