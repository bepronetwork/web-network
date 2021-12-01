import { Tab, Tabs } from 'react-bootstrap'
import { TabbedNavigationProps } from '@interfaces/tabbed-navigation'

export default function TabbedNavigation(props: TabbedNavigationProps) {
  return (
    <Tabs
      defaultActiveKey={props.defaultActiveKey}
      className={` col-md-12 ${props.className}`}
    >
      {props.tabs.map((tab) => (
        <Tab eventKey={tab.eventKey} title={tab.title}>
          {tab.component}
        </Tab>
      ))}
    </Tabs>
  )
}
