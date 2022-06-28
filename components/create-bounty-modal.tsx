import { Fragment, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import DoneIcon from "assets/icons/done-icon";

import Button from "components/button";
import Modal from "components/modal";

export default function CreateBountyModal() {
  const { t } = useTranslation(["common", "create-bounty"]);
  const [show, setShow] = useState<boolean>(false);
  const [bountyTitle, setBountyTitle] = useState<string>();
  const [bountyDescription, setBountyDescription] = useState<string>();
  const [currentSection, setCurrentSection] = useState<number>(0)
  const [progressPercentage, setProgressPercentage] = useState<number>(0)

  const steps = ["details", "bounty", "additional details", "Review "];


  function renderCurrentSection() {
    if(currentSection === 0){
      return renderDetails()
    }
    if(currentSection === 1){
      return <div>
        bounty
      </div>
    }
    if(currentSection === 2){
      return <div>
        additional details
      </div>
    }
    if(currentSection === 3){
      return <div>
        Review
      </div>
    }
  }

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
      if(index === currentSection){
        return "text-white"
      }else if(index < currentSection){
        return "text-primary"
      }else {
        return "color-light-gray"
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
              className={`rounded-circle bg-${index <= currentSection ? 'primary': 'black'}`}
              style={{ width: "18px", height: "18px" }}
            >
              {index < currentSection ? <DoneIcon /> :
               <span className={handleColorState(index)}>{index + 1}</span>}
            </div>
          </div>
          <div
            className="position-absolute d-flex align-items-start flex-column mt-1"
            style={labelStyle}
          >
            <label className={`text-uppercase caption-small ${handleColorState(index)}`}>
              {stepLabel}
            </label>
          </div>
        </div>
      </Fragment>
    );
  }

  function handleNextStepAndCreate() {
    console.log('steps', steps.length, currentSection)
    currentSection+1 < steps.length && setCurrentSection((prevState) => prevState + 1)
  }

  function handleCancelAndBack() {
    if(currentSection === 0){
      setBountyTitle("")
      setBountyDescription("")
      setShow(false)
    }else {
      setCurrentSection((prevState) => prevState - 1)
    }
  }

  function setProgressBar() {
    const progress = [0,30,60,100]
    setProgressPercentage(progress[steps.findIndex((value) => value === steps[currentSection])])
  }

  useEffect(() => {
    setProgressBar()
  },[currentSection])

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
                <span>{currentSection === 0 ? t("common:actions.cancel"): "back"}</span>
              </Button>
            </div>

            <Button
              className="d-flex flex-shrink-0 w-40 btn-block"
              onClick={handleNextStepAndCreate}
            >
              <span>{currentSection !== 3 ? "Next Step" : t(" :create-bounty") }</span>
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
