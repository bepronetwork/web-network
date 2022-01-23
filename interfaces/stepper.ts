import { ReactNode, ReactElement } from 'react'

export interface IStepper {
  children: ReactElement<IStep> | ReactElement<IStep>[]
}

export interface IStep {
  title: string
  index: number
  completed?: boolean
  activeStep: number
  validated?: boolean
  children: ReactNode | ReactNode[]
  handleClick?: () => void
}
