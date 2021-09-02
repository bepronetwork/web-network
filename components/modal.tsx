import {kebabCase} from 'lodash';
import {Modal as ModalBootstrap} from 'react-bootstrap';
import {Modal as ModalProps} from 'types/modal';
import CloseIcon from '@assets/icons/close-icon';
import ButtonTrans from '@components/button-trans';

export default function Modal({
                                title = '',
                                key,
                                children = null,
                                footer = null,
                                onCloseClick = () => {},
                                backdrop = `static`,
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
                    backdrop={backdrop}
                    {...params}>
      <ModalBootstrap.Header className="d-flex justify-content-between">
        <ModalBootstrap.Title>{title}</ModalBootstrap.Title>
        <ButtonTrans onClick={onCloseClick} noAppend={true} className="btn p-1"><CloseIcon /></ButtonTrans>
      </ModalBootstrap.Header>
      <ModalBootstrap.Body>{children}</ModalBootstrap.Body>
      <ModalBootstrap.Footer>{footer && footer || ``}</ModalBootstrap.Footer>
    </ModalBootstrap>
  );
}
