import { useState } from 'react'
import { Accordion, Nav, Tab, useAccordionButton } from 'react-bootstrap'

import ArrowUp from '@assets/icons/arrow-up'
import ArrowDown from '@assets/icons/arrow-down'

import Button from '@components/button'

import { TabbedNavigationProps } from '@interfaces/tabbed-navigation'

export default function TabbedNavigation({
  collapsable = false,
  ...props
}: TabbedNavigationProps) {
  const [collapsed, setCollapsed] = useState(false)
  const toggleOnClick = useAccordionButton(String(!collapsed), () =>
    setCollapsed(!collapsed)
  )

  return (
    <Tab.Container defaultActiveKey={props.defaultActiveKey}>
      <Accordion defaultActiveKey="false">
        <div className={`row ${props.className} align-items-center m-0 ${collapsable && collapsed && 'collapsed' || ''}`}>
          <div className={`col-${(collapsable && '11') || '12'} p-0`}>
            <Nav>
              {props.tabs.map((tab) => (
                <Nav.Item>
                  <Nav.Link eventKey={tab.eventKey}>{tab.title}</Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </div>

          {(collapsable && (
            <div className="col-1 d-flex justify-content-center">
              <Button onClick={toggleOnClick} transparent>
                {(collapsed && <ArrowDown />) || <ArrowUp />}
              </Button>
            </div>
          )) ||
            ''}
        </div>

        <Accordion.Collapse eventKey={String(collapsed)} className="row">
          <Tab.Content className="">
            {props.tabs.map((tab) => (
              <Tab.Pane eventKey={tab.eventKey}>{tab.component}</Tab.Pane>
            ))}
          </Tab.Content>
        </Accordion.Collapse>
      </Accordion>
    </Tab.Container>
  )
}
