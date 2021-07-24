import { ComponentPropsWithRef } from "react";

export interface ButtonDialog extends ComponentPropsWithRef<"button"> {
  title: string;
  footer?:
    | (({ hideModal }: { hideModal: () => void }) => ReactElement)
    | ReactElement;
  label?: string;
  canShow?: boolean;
}
