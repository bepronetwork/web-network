import { ReactNode } from "react";

export type Modal = {
  children: ReactNode | any;
  title: string;
  open: boolean;
  onClose: () => void;
};
