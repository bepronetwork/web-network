import { Fragment, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import DoneIcon from "assets/icons/done-icon";

import Button from "components/button";
import Modal from "components/modal";

import { useNetwork } from "contexts/network";

import { BEPRO_TOKEN, Token } from "interfaces/token";

import TokensDropdown from "./tokens-dropdown";

const { publicRuntimeConfig } = getConfig();

export default function CreateBountyModal() {
  const { t } = useTranslation(["common", "create-bounty"]);

  const { activeNetwork } = useNetwork();
  const [show, setShow] = useState<boolean>(false);
  const [bountyTitle, setBountyTitle] = useState<string>();
  const [bountyDescription, setBountyDescription] = useState<string>();
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [transactionalToken, setTransactionalToken] = useState<Token>();
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  
  const defaultToken = activeNetwork?.networkToken || BEPRO_TOKEN;
  const canAddCustomToken = activeNetwork?.networkAddress === publicRuntimeConfig?.contract?.address ? 
  publicRuntimeConfig?.networkConfig?.allowCustomTokens :
  !!activeNetwork?.allowCustomTokens;

  const steps = ["details", "bounty", "additional details", "Review "];

  function renderCurrentSection() {
    if (currentSection === 0) {
      return renderDetails();
    }
    if (currentSection === 1) {
      return (
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <Button color="black" className="container-bounty w-100 bg-30-hover" > 
                  <span className="">Bounty</span>
              </Button>
            </div>
            <div className="col-md-6">
            <Button color="black" className="container-bounty w-100 bg-30-hover" > 
                  <span className="">Funding Request</span>
              </Button>
            </div>
            <div className="col-md-12 mt-4">

            <TokensDropdown
                    label="Set Bounty Token"
                    tokens={customTokens}
                    defaultToken={defaultToken}
                    canAddToken={canAddCustomToken}
                    addToken={addToken} 
                    setToken={setTransactionalToken}
                  /> 
            </div>
            <div className="col-md-6">a</div>
            <div className="col-md-1">b</div>
            <div className="col-md-5">a</div>
          </div>
        </div>
      );
    }
    if (currentSection === 2) {
      return <div>additional details</div>;
    }
    if (currentSection === 3) {
      return <div>Review</div>;
    }
  }

//TODO: ADDING FILES
  function renderDetails() {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-12 m-0">
            <div className="form-group">
              <label className="caption-small mb-2">
                {t("create-bounty:fields.title.label")}
              </label>
              <input
                type="text"
                className="form-control rounded-lg"
                placeholder={t("create-bounty:fields.title.placeholder")}
                value={bountyTitle}
                onChange={(e) => setBountyTitle(e.target.value)}
              />
              <p className="p-small text-gray trans mt-2">
                {t("create-bounty:fields.title.tip")}
              </p>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="caption-small mb-2">
            {t("create-bounty:fields.description.label")}
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder={t("create-bounty:fields.description.placeholder")}
            value={bountyDescription}
            onChange={(e) => setBountyDescription(e.target.value)}
          />
        </div>
      </div>
    );
  }

  function addToken(newToken: Token) {
    setCustomTokens([
      ...customTokens,
      newToken
    ]);
  }

  function renderColumn(stepLabel: string, index: number) {
    function handleStyleColumns(column) {
      if (column === 0) {
        return "50px";
      } else if (column === 1) {
        return "166px";
      } else {
        return `${column * 144}px`;
      }
    }

    function handleColorState(index) {
      if (index === currentSection) {
        return "text-white";
      } else if (index < currentSection) {
        return "text-primary";
      } else {
        return "color-light-gray";
      }
    }

    const style = { left: handleStyleColumns(index) };
    const dotClass = `d-flex align-items-center justify-content-center rounded-circle bg-light-gray`;
    const dotStyle = { width: "18px", height: "18px" };
    const labelStyle = { top: "20px" };

    return (
      <Fragment key={index}>
        <div
          className="position-absolute d-flex align-items-center flex-column"
          style={style}
        >
          <div className={dotClass} style={dotStyle}>
            <div
              className={`rounded-circle bg-${
                index <= currentSection ? "primary" : "black"
              }`}
              style={{ width: "18px", height: "18px" }}
            >
              {index < currentSection ? (
                <DoneIcon />
              ) : (
                <span className={handleColorState(index)}>{index + 1}</span>
              )}
            </div>
          </div>
          <div
            className="position-absolute d-flex align-items-start flex-column mt-1"
            style={labelStyle}
          >
            <label
              className={`text-uppercase caption-small ${handleColorState(index)}`}
            >
              {stepLabel}
            </label>
          </div>
        </div>
      </Fragment>
    );
  }

  function handleNextStepAndCreate() {
    console.log("steps", steps.length, currentSection);
    currentSection + 1 < steps.length &&
      setCurrentSection((prevState) => prevState + 1);
  }

  function handleCancelAndBack() {
    if (currentSection === 0) {
      setBountyTitle("");
      setBountyDescription("");
      setShow(false);
    } else {
      setCurrentSection((prevState) => prevState - 1);
    }
  }

  function setProgressBar() {
    const progress = [0, 30, 60, 100];
    setProgressPercentage(progress[steps.findIndex((value) => value === steps[currentSection])]);
  }

  useEffect(() => {
    setProgressBar();
    if (!transactionalToken) return setTransactionalToken(BEPRO_TOKEN);
  }, [currentSection, transactionalToken]);

  return (
    <>
      <Button
        className="flex-grow-1"
        textClass="text-uppercase text-white"
        onClick={() => setShow(true)}
      >
        <span>Create Bounty</span>
      </Button>
      <Modal
        show={show}
        title={"Create Bounty"}
        titlePosition="center"
        onCloseClick={() => setShow(false)}
        footer={
          <>
            <div className="d-flex flex-grow-1">
              <Button color="dark-gray" onClick={handleCancelAndBack}>
                <span>
                  {currentSection === 0 ? t("common:actions.cancel") : "back"}
                </span>
              </Button>
            </div>

            <Button
              className="d-flex flex-shrink-0 w-40 btn-block"
              onClick={handleNextStepAndCreate}
            >
              <span>
                {currentSection !== 3 ? "Next Step" : t(" :create-bounty")}
              </span>
            </Button>
          </>
        }
      >
        <>
          <div className="container mb-4 pb-4">
            <div className="row justify-content-md-center">
              <div className="p-0 col-md-10">
                <div className="progress bg-ligth-gray issue-progress-vertical">
                  <div
                    className={`progress-bar bg-primary`}
                    role="progressbar"
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  >
                    {steps.map(renderColumn)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {renderCurrentSection()}
        </>
      </Modal>
    </>
  );
}
