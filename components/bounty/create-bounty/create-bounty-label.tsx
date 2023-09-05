import { ReactNode } from "react";

export default function BountyLabel({
  children,
  required = false,
  className
}: {
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={className}>
      {children} {required && <span className="text-danger">*</span>}
    </label>
  );
}
