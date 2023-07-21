import { ReactElement } from "react";

export function ContainerFilterView({
  label,
  children,
}: {
  label: string;
  children: ReactElement;
}) {
  return (
    <div className="mb-3">
      <span className="caption-small font-weight-medium text-gray-100 text-capitalize">
        {label}
      </span>
      {children}
    </div>
  );
}
