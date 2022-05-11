import { GetStaticProps } from "next";
import React from "react";
import { ProgressBar } from "react-bootstrap";
import Button from "./button";

export default function IssueDraftProgress({ amountUsed, amountTotal }) {
  return (
    <div className="container mt-up">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="content-wrapper mb-4">
            <div className="row align-items-center">
              <div className="col-md-9">
                <div className="d-flex flex-column">
                  <h3 className="h4 mb-3">
                    <span className="color-purple">{amountUsed}</span> /{" "}
                    {amountTotal} Oracles
                  </h3>
                  <ProgressBar
                    variant="info"
                    now={(amountUsed * 100) / amountTotal}
                  />
                </div>
              </div>
              <div className="col-md-3 justify-content-center">
                <Button className="w-100" transparent>
                  View all addresses
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
