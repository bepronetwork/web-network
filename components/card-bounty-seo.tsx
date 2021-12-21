import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { toPng, toJpeg } from "html-to-image";
import { IssueState } from "@interfaces/issue-data";
import BeproLogo from "@assets/icons/bepro-blue";

interface CardBountyProps {
  state: IssueState;
  issueId: string;
  title: String;
  repo: string;
  ammount: number;
  devs?: number;
  prs?: number;
  proposals?: number;
}

const CardBountySeo = forwardRef(({
  state,
  issueId,
  title,
  repo,
  ammount,
  devs = 0,
  prs = 0,
  proposals = 0
}: CardBountyProps, ref) => {
  const componentRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    async makeCard() {
      if (!componentRef.current) {
        return;
      }
      const picture = await toJpeg(componentRef.current, {
        height: 627,
        width: 1200,
        cacheBust: true,
        skipAutoScale: true,
      });

      const link = document.createElement("a");
      link.download = "my-image-name.png";
      link.href = picture;
      link.click();

        return picture;
      }
    }
  ));

  function handleColorState(state: IssueState) {
    switch (state?.toLowerCase()) {
      case "draft": {
        return "bg-white-50";
      }
      case "open": {
        return "bg-blue text-white";
      }
      case "in progress": {
        return "bg-blue text-white";
      }
      case "canceled": {
        return "bg-dark-gray text-white";
      }
      case "closed": {
        return "bg-dark-gray text-white";
      }
      case "ready": {
        return "bg-success";
      }
      case "done": {
        return "bg-success";
      }
      case "disputed": {
        return "bg-danger text-white";
      }
      default: {
        return "blue";
      }
    }
  }

  return (
    <>
      <div className="position-relative overflow-hidden">
        <div
          className="position-absolute bg-dark p-5 bg-card-bounty-seo"
          ref={componentRef}
          style={{ height: "627px", width: "1200px" }}
        >
          <div className="d-flex flex-column m-3">
            <div className="mb-3 d-flex flex-row align-items-center">
              <h3
                className={`h3 d-inline-block p-2 text-uppercase rounded family-SemiBold ${handleColorState(
                  state
                )} mr-2`}
              >
                {state}
              </h3>
              <h3 className="h3 family-SemiBold text-gray">#{issueId}</h3>
            </div>
            <h2 className="my-3 py-2 h2 family-SemiBold">{title}</h2>
            <div className="d-flex flex-column mt-5">
              <div className={`px-1 rounded border border-2 text-uppercase border-blue text-blue`}
              style={{width: 'fit-content'}}>
                  <span>{repo}</span>
              </div>
              <h1 className="h1 my-4 py-2 text-white text-opacity-1">
                {ammount} <label className="h3 text-blue">$BEPRO</label>
              </h1>
              <div className="d-flex flex-row justify-content-between mt-4">
                <div className="d-flex flex-column">
                  <span className="h3 family-SemiBold text-gray">{devs}</span>
                  <label className="text-nowrap">WORKING</label>
                </div>
                <div className="d-flex flex-column">
                  <span className="h3 family-SemiBold text-gray">{prs}</span>
                  <label className="text-nowrap">PULL REQUESTS</label>
                </div>
                <div className="d-flex flex-column">
                  <span className="h3 family-SemiBold text-gray">{proposals}</span>
                  <label className="text-nowrap">PROPOSALS</label>
                </div>
                <div className="text-center">
                  <BeproLogo aria-hidden={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
})

export default CardBountySeo;
