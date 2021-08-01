import React from "react";
import OraclesActions from "components/oracles-actions";
import OraclesDelegate from "components/oracles-delegate";
import OraclesTakeBack from "components/oracles-take-back";
import TemplateMyOracles from "components/template-my-oracles";

export default function MyOracles() {
  return (
    <TemplateMyOracles>
      {(handleConfirm: void) => (
        <>
          <div className="container">
            <div className="row justify-content-center mb-5">
              <OraclesActions onConfirm={handleConfirm} />
              <OraclesDelegate onConfirm={handleConfirm} />
            </div>
          </div>
          <div className="container">
            <div className="row justify-content-center">
              <OraclesTakeBack />
            </div>
          </div>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-10">
                <div className="content-wrapper mb-5">
                  <div className="row">
                    <div className="col-md-6">
                      <h4 className="h4">How to use Oracles?</h4>
                      <p>
                        Oracles can be used on Council to vote and approve
                        issues
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h4 className="h4">Why use Oracles?</h4>
                      <p>
                        Oracles can be used on Council to vote and approve
                        issues
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </TemplateMyOracles>
  );
}
