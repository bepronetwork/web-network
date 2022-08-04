import { Modal as ModalBootstrap } from "react-bootstrap";

import { kebabCase } from "lodash";

import CloseIcon from "assets/icons/close-icon";

import { Modal as ModalProps } from "types/modal";

import Button from "./button";

export default function Modal({
  title = "",
  centerTitle = false,
  subTitle = "",
  key,
  children = null,
  footer = null,
  onCloseClick,
  onCloseDisabled = false,
  backdrop = "static",
  titlePosition = "start",
  titleClass,
  okLabel = "",
  cancelLabel = "",
  onOkClick,
  titleComponent,
  subTitleComponent,
  okDisabled = false,
  ...params
}: ModalProps) {
  const modalTitle = `${kebabCase(key || title)}-modal`;

  function renderFooter() {
    if (footer) return footer;
    if (okLabel || cancelLabel)
      return (
        <div className="mb-2 d-flex flex-row justify-content-between">
          {cancelLabel && (
            <button className="btn btn-outline-gray" onClick={() => onCloseClick()} disabled={onCloseDisabled}>
              {cancelLabel}
            </button>
          )}

          {okLabel && (
            <button
              disabled={okDisabled}
              className="btn btn-primary"
              onClick={() => onOkClick()}
            >
              {okLabel}
            </button>
          )}
        </div>
      );
    return <></>;
  }

  return (
    <ModalBootstrap
      centered
      onEscapeKeyDown={onCloseClick}
      onHide={onCloseClick}
      aria-labelledby={modalTitle}
      aria-describedby={modalTitle}
      id={modalTitle}
      backdrop={backdrop}
      {...params}
    >
      <ModalBootstrap.Header
        className={`relative d-flex w-100 flex-column justify-content-${titlePosition} `}
      >
        <ModalBootstrap.Title
          className={`pt-3 text-white ${titleClass || ""} ${
            centerTitle ? "text-center w-100" : ""
          }`}
        >
          <h3>{titleComponent || title}</h3>
        </ModalBootstrap.Title>

        {subTitle || subTitleComponent && <p className="text-white caption-small">{subTitleComponent || subTitle }</p>}

        {onCloseClick && (
          <Button
            transparent
            className="close-button p-1 position-absolute end-94 text-gray mt-1"
            onClick={onCloseClick}
            disabled={onCloseDisabled}
          >
            <CloseIcon />
          </Button>
        )}
      </ModalBootstrap.Header>
      <ModalBootstrap.Body>{children}</ModalBootstrap.Body>
      <ModalBootstrap.Footer className="row mx-0">{renderFooter()}</ModalBootstrap.Footer>
    </ModalBootstrap>
  );
}
