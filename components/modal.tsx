import {kebabCase} from 'lodash';
import {Modal as ModalBootstrap} from 'react-bootstrap';
import {Modal as ModalProps} from 'types/modal';
import CloseIcon from '@assets/icons/close-icon';
import Button from './button';

export default function Modal({
                                title = '', centerTitle = false,
                                key,
                                children = null,
                                footer = null,
                                onCloseClick,
                                backdrop = `static`,
                                titlePosition = `start`,
                                titleClass, okLabel = ``, cancelLabel = ``, onOkClick = () => {},
                                titleComponent,
                                ...params
                              }: ModalProps): JSX.Element {
  const modalTitle = `${kebabCase(key || title)}-modal`;

  function renderFooter() {
    if (footer)
      return footer;
    if (okLabel || cancelLabel)
      return <div className="mb-3">
        {okLabel && <button className="btn btn-primary mr-2" onClick={() => onOkClick()}>{okLabel}</button>}
        {cancelLabel && <button className="btn btn-gray" onClick={() => onCloseClick()}>{cancelLabel}</button>}
        </div>
    return <></>
  }

  return (
    <ModalBootstrap centered
                    onEscapeKeyDown={onCloseClick}
                    onHide={onCloseClick}
                    aria-labelledby={modalTitle}
                    aria-describedby={modalTitle}
                    id={modalTitle}
                    backdrop={backdrop}
                    {...params}>
      <ModalBootstrap.Header className={`relative d-flex w-100 justify-content-${titlePosition} `}>
        <ModalBootstrap.Title className={`pt-3 text-white ${titleClass || ``} ${centerTitle ? `text-center w-100` : ``}`}>
          <h3>{titleComponent || title}</h3>
        </ModalBootstrap.Title>
        {onCloseClick && <Button transparent className="close-button p-1 position-absolute end-94 text-gray" onClick={onCloseClick}><CloseIcon /></Button>}
      </ModalBootstrap.Header>
      <ModalBootstrap.Body>{children}</ModalBootstrap.Body>
      <ModalBootstrap.Footer>{renderFooter()}</ModalBootstrap.Footer>
    </ModalBootstrap>
  );
}
