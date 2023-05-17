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
    <div className={`${className ? className : null} d-flex me-4`}>
      <span className="text-white-40 me-2">{label}</span>
      {children}
    </div>
  );
}
