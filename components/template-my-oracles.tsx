import AccountHero from "./account-hero";
import Link from "next/link";
import React, { useState } from "react";
import OraclesStatus from "./oracles-status";

type State = {
  info: {
    title: string;
    description: string;
  };
};

export default function TemplateMyOracles({ children }): JSX.Element {
  const [info, setInfo] = useState<State["info"]>({
    title: "",
    description: "",
  });
  const [showStatus, setShowStatus] = useState<boolean>(false);
  const [isSucceed, setIsSucceed] = useState<boolean>(false);

  function handleConfirm({
    status,
    info,
  }: {
    status: boolean;
    info: State["info"];
  }) {
    setIsSucceed(status);
    setShowStatus(true);
    setInfo(info);
  }

  return (
    <>
      <div>
        <AccountHero />
        <div className="container">
          <div className="row">
            <div className="d-flex justify-content-center mb-3">
              <Link href="/account/" passHref>
                <a className="subnav-item active mr-3 h3">My issues</a>
              </Link>
              <Link href="/account/my-oracles" passHref>
                <a className="subnav-item h3">My oracles</a>
              </Link>
            </div>
          </div>
        </div>
        {typeof children === "function" ? children(handleConfirm) : children}
      </div>
      <OraclesStatus
        info={info}
        show={showStatus}
        isSucceed={isSucceed}
        onClose={() => setShowStatus(false)}
      />
    </>
  );
}
