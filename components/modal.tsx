import {kebabCase} from 'lodash';
import {Modal as ModalBootstrap} from 'react-bootstrap';
import {Modal as ModalProps} from 'types/modal';
import CloseIcon from '@assets/icons/close-icon';
import Button from './button';

export default function Modal({
                                title = '',
                                key,
                                children = null,
                                footer = null,
                                onCloseClick,
                                backdrop = `static`,
                                titlePosition = `start`,
                                titleClass,
                                ...params
                              }: ModalProps): JSX.Element {
  const modalTitle = `${kebabCase(key || title)}-modal`;

  return (
    <ModalBootstrap centered
                    onEscapeKeyDown={onCloseClick}
                    onBackdropClick={onCloseClick}
                    onHide={onCloseClick}
                    aria-labelledby={modalTitle}
                    aria-describedby={modalTitle}
                    id={modalTitle}
                    backdrop={backdrop}
                    {...params}>
      <ModalBootstrap.Header className={`relative d-flex w-100 justify-content-${titlePosition} `}>
        <ModalBootstrap.Title className={`${titleClass}`}>{title}</ModalBootstrap.Title>
        {onCloseClick && <Button transparent className="p-1 position-absolute end-90" onClick={onCloseClick}><CloseIcon /></Button>}
      </ModalBootstrap.Header>
      <ModalBootstrap.Body>{children}</ModalBootstrap.Body>
      <ModalBootstrap.Footer>{footer && footer || ``}</ModalBootstrap.Footer>
    </ModalBootstrap>
  );
}
