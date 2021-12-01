import { ReactNode } from 'react'

export interface TabbedNavigationItem {
  eventKey: string
  title: string
  component: ReactNode
}

export interface TabbedNavigationProps {
  defaultActiveKey: string
  className?: string
  tabs: TabbedNavigationItem[]
}
