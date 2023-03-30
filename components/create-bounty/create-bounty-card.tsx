import { ReactNode } from "react";

interface CardProps {
  currentStep: number;
  maxSteps: number;
  children: ReactNode;
}
export default function CreateBountyCard({
  currentStep,
  maxSteps,
  children,
}: CardProps) {
  return (
    <div className="bg-gray-900 p-4 border-radius-4 border border-gray-850">
      <span className="text-gray">
        Step {currentStep} of {maxSteps}
      </span>
      {children}
    </div>
  );
}
