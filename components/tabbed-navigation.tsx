import {useEffect, useState} from "react";
import {Accordion, Nav, OverlayTrigger, Popover, Tab, useAccordionButton} from "react-bootstrap";

import ArrowDown from "assets/icons/arrow-down";
import ArrowUp from "assets/icons/arrow-up";
import InfoIconEmpty from "assets/icons/info-icon-empty";

import Button from "components/button";

import {TabbedNavigationProps} from "interfaces/tabbed-navigation";

import useBreakPoint from "x-hooks/use-breakpoint";

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
    <div className="d-none d-xl-block">
      <OverlayTrigger placement="bottom" overlay={popover}>
          <span className="text-gray-500">
              <InfoIconEmpty width={14} height={14} color="text-gray-500" />
          </span>
      </OverlayTrigger>
    </div>
  );
}

export default function TabbedNavigation({
  collapsable = false,
  tabs,
  defaultActiveKey,
  onTransition,
  forceActiveKey,
  ...props
}: TabbedNavigationProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState<string>();

  const { isMobileView } = useBreakPoint();

  const toggleOnClick = useAccordionButton(String(!collapsed), () =>
    setCollapsed(!collapsed));

  function getDefaultActiveTab() {
    return tabs.find((tab) => tab.isEmpty === false)?.eventKey;
  }

  function handleTransition(newActiveKey: string) {
    setActiveKey(newActiveKey);
    onTransition?.(newActiveKey);
  }

  useEffect(() => {
    if (!defaultActiveKey) setActiveKey(getDefaultActiveTab());
  }, [tabs]);

  useEffect(() => {
    setActiveKey(forceActiveKey);
  }, [forceActiveKey])

  return (
    <Tab.Container defaultActiveKey={defaultActiveKey} activeKey={activeKey} onSelect={handleTransition}>
      <Accordion defaultActiveKey="false">
        <div
          className={`row ${props.className} align-items-center pe-1 m-0 ${
            (collapsable && collapsed && "collapsed") || ""
          }`}
        >
          <div className={`col-${(collapsable && "11") || "12"} p-0`}>
            <Nav>
              {tabs.map((tab) => (
                <Nav.Item key={`${tab.eventKey}`} className="cursor-pointer">
                  <Nav.Link eventKey={tab.eventKey} className={isMobileView ? "py-3" : null}>
                    <div className="col d-flex">
                      <span className={!isMobileView ? "mr-2" : "fs-smallest"}>{tab.title}</span>
                      {renderDescription(tab?.description)}
                    </div>
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </div>

          {(collapsable && (
            <div className="col-1 d-flex justify-content-center .d-none .d-sm-block">
              <Button onClick={toggleOnClick} transparent>
                {(collapsed && <ArrowDown />) || <ArrowUp />}
              </Button>
            </div>
          )) ||
            ""}
        </div>

        <Accordion.Collapse eventKey={String(collapsed)} className="row">
          <Tab.Content className="">
            {tabs.map((tab) => (
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
