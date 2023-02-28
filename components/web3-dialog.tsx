import {useEffect} from "react";
import {Modal} from "react-bootstrap";
import {isMobile} from "react-device-detect";

import {kebabCase} from "lodash";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import WebThreeUnavailable from "assets/web3-unavailable";

import Button from "components/button";
import MobileNotSupported from "components/mobile-not-supported";

import {useAppState} from "contexts/app-state";
import {changeShowWeb3} from "contexts/reducers/update-show-prop";

import { useNetwork } from "x-hooks/use-network";

export default function WebThreeDialog() {
  const router = useRouter();
  const {t} = useTranslation("common");

  const { getURLWithNetwork } = useNetwork();
  const {
    dispatch,
    state: {show: {web3Dialog: showWeb3Dialog}},
  } = useAppState();

  function handleClickTryAgain() {
    window.location.reload();
  }

  useEffect(() => {
    if (![
      "/explore",
      "/leaderboard",
      "/networks",
      getURLWithNetwork("/").pathname,
      getURLWithNetwork("/bounties").pathname,
      getURLWithNetwork("/curators").pathname,
      "/[network]/[chain]/bounty",
      "/[network]/[chain]",
    ].includes(router.pathname))
      dispatch(changeShowWeb3(!window?.ethereum));
  }, [router.pathname]);

  if (showWeb3Dialog && isMobile) return <MobileNotSupported/>

  if (showWeb3Dialog && !isMobile)
    return (
      <div className="container-fluid vw-100 vh-100 bg-image bg-main-image">
        <Modal
          centered
          aria-labelledby={`${kebabCase("WebThreeDialog")}-modal`}
          aria-describedby={`${kebabCase("WebThreeDialog")}-modal`}
          show={showWeb3Dialog}
        >
          <Modal.Header>
            <Modal.Title>{t("modals.web3-dialog.title")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="caption-small text-warning text-center">
              {t("modals.web3-dialog.eth-not-available")}
            </p>
            <div className="d-flex flex-column align-items-center">
              <WebThreeUnavailable/>
              <p className="p mb-0 mt-4 text-center fs-small">
                {t("modals.web3-dialog.message")}
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <a
              className="text-decoration-none"
              href="https://metamask.io/download.html"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Button color="dark-gray">{t("actions.install")}</Button>
            </a>
            <Button onClick={handleClickTryAgain}>
              {t("actions.try-again")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );

  return <></>;
}
