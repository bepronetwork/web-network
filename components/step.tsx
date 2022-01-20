import { Collapse } from 'react-bootstrap'

import { IStep } from '@interfaces/stepper'

export default function Step({
  title,
  index,
  completed = false,
  activeStep,
  children,
  handleClick = () => {},
  ...props
}: IStep) {
  const isActive = activeStep === index

  return (
    <div className="step border-radius-8 p-4">
      <div className="row">
        <span
          className={`caption-medium ${
            isActive ? 'text-white' : 'text-ligth-gray'
          }`}
        >{`${index}. ${title}`}</span>
      </div>

      <Collapse in={isActive}>
        <div className="row pt-4">{children}</div>
      </Collapse>
    </div>
  )
}
