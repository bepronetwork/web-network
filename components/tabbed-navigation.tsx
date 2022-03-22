import { useState } from "react";
import {
  Accordion,
  Nav,
  Tab,
  OverlayTrigger,
  Popover,
  useAccordionButton
} from "react-bootstrap";

import ArrowDown from "assets/icons/arrow-down";
import ArrowUp from "assets/icons/arrow-up";
import InfoIcon from "assets/icons/info-icon";

import Button from "components/button";

import { TabbedNavigationProps } from "interfaces/tabbed-navigation";

function renderDescription(description: string) {
  if (!description) return <></>;

  const popover = (
    <Popover id="popover-tabbed-description" className="p-2 bg-white">
      <Popover.Body
        as="p"
        className="p-small-bold m-0 py-0 px-2 text-light-gray"
      >
        {description}
      </Popover.Body>
    </Popover>
  );

  return (
    <>
      <OverlayTrigger placement="bottom" overlay={popover}>
        <span className="text-white-10">
          <InfoIcon width={14} height={14} color="text-white-10" />
        </span>
      </OverlayTrigger>
    </>
  );
}

export default function TabbedNavigation({
  collapsable = false,
  ...props
}: TabbedNavigationProps) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleOnClick = useAccordionButton(String(!collapsed), () =>
    setCollapsed(!collapsed));

  return (
    <Tab.Container defaultActiveKey={props.defaultActiveKey}>
      <Accordion defaultActiveKey="false">
        <div
          className={`row ${props.className} align-items-center m-0 ${
            (collapsable && collapsed && "collapsed") || ""
          }`}
        >
          <div className={`col-${(collapsable && "11") || "12"} p-0`}>
            <Nav>
              {props.tabs.map((tab) => (
                <Nav.Item key={`${tab.eventKey}`}>
                  <Nav.Link eventKey={tab.eventKey}>
                    <div className="col">
                      <span className="mr-2">{tab.title}</span>
                      {renderDescription(tab?.description)}
                    </div>
                  </Nav.Link>
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
            ""}
        </div>

        <Accordion.Collapse eventKey={String(collapsed)} className="row">
          <Tab.Content className="">
            {props.tabs.map((tab) => (
              <Tab.Pane key={`${tab.eventKey}`} eventKey={tab.eventKey}>
                {tab.component}
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Accordion.Collapse>
      </Accordion>
    </Tab.Container>
  );
}
