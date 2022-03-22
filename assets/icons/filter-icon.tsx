import { memo } from "react";

function FilterIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="12" height="2" rx="1" fill="white" />
      <rect x="2" y="6" width="10" height="2" rx="1" fill="white" />
      <rect x="3" y="10" width="8" height="2" rx="1" fill="white" />
    </svg>
  );
}

export default memo(FilterIcon);
