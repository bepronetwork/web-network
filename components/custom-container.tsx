export default function CustomContainer({
  children,
  className = undefined,
  childWrapperClassName = undefined,
  col = "col-10"
}) {
  return (
    <>
      <div className={`container ${className || ""}`}>
        <div className={`${ childWrapperClassName || "row justify-content-center"}`}>
          <div className={col}>{children}</div>
        </div>
      </div>
    </>
  );
}
