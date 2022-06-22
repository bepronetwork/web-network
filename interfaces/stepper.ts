import { ReactNode } from "react";

export interface StepProps {
  title: string;
  index: number;
  completed?: boolean;
  activeStep: number;
  validated: boolean;
  children: ReactNode | ReactNode[];
  finishLabel?: string;
  handleClick: (index) => void;
  handleFinish?: () => void;
}

export type StepWrapperProps = Partial<StepProps>;
