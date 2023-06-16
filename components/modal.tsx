import { Modal as ModalBootstrap } from "react-bootstrap";

import { kebabCase } from "lodash";

import CloseIcon from "assets/icons/close-icon";

import Button from "components/button";

import { Modal as ModalProps } from "types/modal";

import useBreakPoint from "x-hooks/use-breakpoint";

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
  okColor = "primary",
  isExecuting = false,
  ...params
}: ModalProps) {
  const { isMobileView } = useBreakPoint();

  if (!params.show)
    return <></>;

  const modalTitle = `${kebabCase(key || title)}-modal`;

  function renderFooter() {
    if (footer) return footer;
    if (okLabel || cancelLabel)
      return (
        <div className="mb-2 d-flex flex-row justify-content-between">
          {cancelLabel && (
            <button className="btn btn-gray-850" onClick={() => onCloseClick()} disabled={onCloseDisabled}>
              {cancelLabel}
            </button>
          )}

          {okLabel && (
            <button
              disabled={okDisabled || isExecuting}
              className={`btn btn-${okColor}`}
              onClick={() => onOkClick()}
            >
              {okLabel}
              { isExecuting && 
                <span className="spinner-border spinner-border-xs ml-1" />
              }
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
      fullscreen={isMobileView as string | true}
      {...params}
    >
      <ModalBootstrap.Header
        className={`relative d-flex  flex-column justify-content-${titlePosition} ${
          titlePosition ? "text-center" : ""
        } text-break`}
      >
        <ModalBootstrap.Title
          className={`text-white ${titleClass || ""} ${
            centerTitle ? "text-center w-100" : ""
          }`}
        >
          <h4>{titleComponent || title}</h4>
        </ModalBootstrap.Title>

        {subTitle || subTitleComponent && <p className="text-white caption-small">{subTitleComponent || subTitle }</p>}

        {onCloseClick && (
          <Button
            transparent
            className="close-button p-0 position-absolute text-gray not-svg"
            onClick={onCloseClick}
            disabled={isExecuting||onCloseDisabled}
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
