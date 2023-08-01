export const FlexRow = ({ children, className = "" }) => (
  <div className={`d-flex flex-row ${className}`}>{children}</div>
);

export const FlexColumn = ({ children, className = "" }) => (
  <div className={`d-flex flex-column ${className}`}>{children}</div>
);