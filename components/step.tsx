import { Collapse } from 'react-bootstrap'

import { IStep } from '@interfaces/stepper'
import SuccessIcon from '@assets/icons/success-icon'

export default function Step({
  title,
  index,
  completed = false,
  activeStep,
  children,
  validated = false,
  handleClick = () => {},
  ...props
}: IStep) {
  const isActive = activeStep === index

  return (
    <div className="step border-radius-8 p-4">
      <div className="d-flex flex-row align-items-center cursor-pointer" onClick={handleClick}>
        <span
          className={`caption-medium mr-1 ${
            isActive ? 'text-white' : 'text-ligth-gray'
          }`}
        >{`${index}. ${title}`}</span>

        {validated && <SuccessIcon /> || ''}
      </div>

      <Collapse in={isActive}>
        <div className="row pt-4">{children}</div>
      </Collapse>
    </div>
  )
}
