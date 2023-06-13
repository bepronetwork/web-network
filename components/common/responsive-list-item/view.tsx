import { ReactNode } from "react";

import ResponsiveListItemColumn from "components/common/responsive-list-item/column/view";
import If from "components/If";

import { ResponsiveListItemColumnProps } from "types/components";

interface NetworkListItemProps {
  onClick?: () => void;
  icon: ReactNode;
  label: ReactNode;
  secondaryLabel?: ReactNode;
  thirdLabel?: ReactNode;
  columns: ResponsiveListItemColumnProps[];
}

export default function ResponsiveListItem({
  onClick,
  icon,
  label,
  secondaryLabel,
  thirdLabel,
  columns,
}: NetworkListItemProps) {
  const firstColumn = [...columns].shift();

  return (
    <div 
      className="list-item p-3 row border-radius-8 border border-gray-850 bg-gray-900 cursor-pointer" 
      onClick={onClick}
    >
      <div className="col-sm-12 col-md">
        <div className="row align-items-center">
          <div className="col-auto">
            {icon}
          </div>

          <div className="col-auto px-0">
            <div className="row align-items-center mb-1">
              <div className="col-auto">
                <span className="caption-small font-weight-medium text-white">{label}</span>
              </div>

              <If condition={!!secondaryLabel}>
                <div className="col-auto px-0">
                  {secondaryLabel}
                </div>
              </If>
            </div>

            {thirdLabel}

            <If condition={!!firstColumn}>
              <ResponsiveListItemColumn {...firstColumn} breakpoints={{ xs: true, md: false }} />
            </If>
          </div>
        </div>
      </div>

      {columns?.map(ResponsiveListItemColumn)}
    </div>
  );
}
