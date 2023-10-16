import { ReactElement } from "react";

export default function BountyItemLabel({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactElement;
  className?: string;
}) {
  return (
    <div className={`${className ? className : null} d-flex text-white align-items-center`}>
      <span className="text-gray-600 text-capitalize me-2">{label}</span>
      {children}
    </div>
  );
}
