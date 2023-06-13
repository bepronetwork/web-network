import { ReactNode } from "react";

import ResponsiveListItemColumn from "components/common/responsive-list-item/column/view";
import If from "components/If";
import ResponsiveWrapper from "components/responsive-wrapper";

import { ResponsiveListItemColumnProps } from "types/components";

interface NetworkListItemProps {
  onClick?: () => void;
  icon: ReactNode;
  label: ReactNode;
  secondaryLabel?: ReactNode;
  thirdLabel?: ReactNode;
  columns: ResponsiveListItemColumnProps[];
  mobileColumnIndex?: number;
  action?: ReactNode;
}

export default function ResponsiveListItem({
  onClick,
  icon,
  label,
  secondaryLabel,
  thirdLabel,
  columns,
  mobileColumnIndex = 0,
  action,
}: NetworkListItemProps) {
  const firstColumn = columns[mobileColumnIndex];

  return (
    <div 
      className="p-3 row border-radius-8 border border-gray-850 bg-gray-900 cursor-pointer" 
      onClick={onClick}
    >
      <div className="col-sm-12 col-md-auto col-lg">
        <div className="row align-items-center">
          <div className="col-auto">
            {icon}
          </div>

          <div className="col-auto px-0">
            <div className="row align-items-center">
              <div className="col-auto">
                <span className="caption-small font-weight-medium text-white d-flex align-items-center gap-2">
                  {label}

                  <If condition={!!action}>
                    <ResponsiveWrapper
                      className={`col d-flex flex-row align-items-center justify-content-center`}
                      xs={true}
                      md={false}
                    >
                      {action}
                    </ResponsiveWrapper>
                  </If>
                </span>
              </div>

              <If condition={!!secondaryLabel}>
                <div className="col-auto px-0">
                  {secondaryLabel}
                </div>
              </If>
            </div>

            <If condition={!!thirdLabel}>
              <div className="mt-1">
                {thirdLabel}
              </div>
            </If>

            <If condition={!!firstColumn}>
              <ResponsiveListItemColumn {...firstColumn} justify="start" breakpoints={{ xs: true, md: false }} />
            </If>
          </div>
        </div>
      </div>

      {columns?.map(ResponsiveListItemColumn)}

      <If condition={!!action}>
        <ResponsiveWrapper
          className={`col d-flex flex-row align-items-center justify-content-center`}
          xs={false}
          md={true}
        >
          {action}
        </ResponsiveWrapper>
      </If>
    </div>
  );
}
