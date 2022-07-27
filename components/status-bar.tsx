import { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import NetworkIdentifier from "components/network-identifier";
import Translation from "components/translation";

import { ApplicationContext } from "contexts/application";
import { changeMicroServiceReady } from "contexts/reducers/change-microservice-ready";

import useApi from "x-hooks/use-api";


export default function StatusBar() {
  const {
    dispatch,
    state: { microServiceReady }
  } = useContext(ApplicationContext);
  const [ms, setMs] = useState(0);
  const { getHealth } = useApi();
  const { t } = useTranslation("common");

  function neverEndingUpdate() {
    const past = +new Date();
    getHealth().then((state) => {
      dispatch(changeMicroServiceReady(state));
      setMs(+new Date() - past);
      setTimeout(neverEndingUpdate, 60 * 1000);
    });
  }

  function renderNetworkStatus() {
    let info;

    if (microServiceReady === null) info = ["white-50", t("status.waiting")];
    else if (microServiceReady === false)
      info = ["danger", t("status.network-problems")];
    else
      info =
        ms <= 200
          ? ["success", t("status.operational")]
          : ms <= 500
          ? ["warning", t("status.network-congestion")]
          : ["orange", t("status.network-congestion")];

    const indicatorStyle = { height: ".5rem", width: ".5rem" };
    const indicatorClass = `d-inline-block me-2 rounded bg-${info[0]}`;

    return (
      <a
        className="text-decoration-none text-white-50"
        href="https://bepronetwork.statuspage.io/"
        target="_blank"
        rel="noreferrer"
      >
        <span className={indicatorClass} style={indicatorStyle} />
        <span className="caption-small mr-2">
          {info[1]} {ms}ms
        </span>
      </a>
    );
  }

  useEffect(neverEndingUpdate, []);

  return (
    <div
      className={`position-fixed bg-shadow bottom-0 w-100 px-3 py-0 d-flex border-disabled 
        border-top d-flex flex-row align-items-center`}
      id="status-bar"
    >
      <div className="border-disabled-right">
        {renderNetworkStatus()}
      </div>

      <div className="ms-3 flex-grow-1 text-center text-uppercase family-Regular status-bar-text text-ligth-gray">
        <Translation label="status.tagline" />
        <a
          href="https://www.bepro.network/terms-and-conditions"
          target="_blank"
          className="ms-2 text-decoration-none text-primary"
          rel="noreferrer"
        >
          <Translation label="status.terms-and-conditions" />
        </a>
      </div>

      <div className="border-disabled-left py-1">
        <NetworkIdentifier />
      </div>
    </div>
  );
}
