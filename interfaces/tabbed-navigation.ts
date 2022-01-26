import { ReactElement, ReactNode } from 'react'

export interface TabbedNavigationItem {
  eventKey: string
  title: string | ReactElement
  component: ReactNode
}

export interface TabbedNavigationProps {
  defaultActiveKey: string
  className?: string
  collapsable?: boolean
  tabs: TabbedNavigationItem[]
}
