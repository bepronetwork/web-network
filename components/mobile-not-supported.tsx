import React from "react";

import BeproLogo from "assets/icons/bepro-logo";

import MobileInformation from "components/mobile-information";


export default function MobileNotSupported() {
  return (
    <>
      <div />
      <div
        className="bg-blue d-block text-center pt-5"
        style={{ height: "100vh", width: "100vw" }}
      >
        <BeproLogo aria-hidden={true} />
      </div>
      <MobileInformation />
    </>
  );
}
