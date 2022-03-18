import React from "react";

import Modal from "components/modal";
import { useTranslation } from "next-i18next";

import ChatIcon from "assets/icons/chat-icon";
import FeedbackIcon from "assets/icons/feedback-icon";
import HelpIcon from "assets/icons/help-icon";
import PageIcon from "assets/icons/page-icon";

export default function HelpModal({ show = false, onCloseClick = () => {} }) {
  const { t } = useTranslation("common");
  const helpItem = (title = "", tagline = "", icon, href = "") => ({
    title,
    tagline,
    icon,
    href
  });

  const helpItems = [
    helpItem(
      "modals.help-modal.help-center.title",
      "modals.help-modal.help-center.content",
      <HelpIcon />,
      "http://support.bepro.network"
    ),
    helpItem(
      "modals.help-modal.api-documentation.title",
      "modals.help-modal.api-documentation.content",
      <PageIcon />,
      "http://docs.bepro.network"
    ),
    helpItem(
      "modals.help-modal.live-chat.title",
      "modals.help-modal.live-chat.content",
      <ChatIcon />,
      "https://discord.gg/bepronetwork"
    ),
    helpItem(
      "modals.help-modal.provide-feedback.title",
      "modals.help-modal.provide-feedback.content",
      <FeedbackIcon />,
      "https://discord.gg/bepronetwork"
    )
  ];

  function HelpItemRow(item, i) {
    const rowClassName =
      "row row-button d-flex align-items-center cursor-pointer bg-opac-hover mxn-3 px-3 text-decoration-none";

    return (
      <a
        className={rowClassName}
        key={item.title}
        href={`${item.href}`}
        target="_blank"
        style={{ height: 70 }}
        rel="noreferrer"
      >
        <div className="col-2 text-center">{item.icon}</div>
        <div className="col-10">
          <strong className="d-block caption-small text-white">
            {t(item.title)}
          </strong>
          <span className="d-block text-white-50 p-small">
            {t(item.tagline)}
          </span>
        </div>
      </a>
    );
  }

  return (
    <>
      <Modal
        show={show}
        title={String(t("modals.help-modal.title"))}
        titlePosition="center"
        onCloseClick={onCloseClick}
        backdrop={true}
      >
        {helpItems.map(HelpItemRow)}
      </Modal>
    </>
  );
}
