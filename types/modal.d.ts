import { ReactElement, ReactNode } from "react";
import { ModalProps } from "react-bootstrap";

export interface Modal extends ModalProps {
  title?: string;
  titleComponent?: ReactElement;
  key?: string;
  children: ReactElement | ReactElement[] | ReactNode;
  footer?: ReactElement | ReactElement[];
  onCloseClick?: () => void;
  onCloseDisabled?: boolean;
  okDisabled?: boolean;
  onOkClick?: () => void;
  okColor?: string;
  isOkActionExecuting?: boolean;
}
