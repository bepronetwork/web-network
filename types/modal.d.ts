import { ReactElement } from "react";
import { ModalProps } from "react-bootstrap";

export interface Modal extends ModalProps {
  title: string;
  children: ReactElement | ReactElement[];
  footer: ReactElement | ReactElement[];
}
