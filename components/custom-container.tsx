export default function CustomContainer({ children, className = undefined, childWrapperClassName = undefined }) {
  return (
    <>
      <div className={`container ${className || ""}`}>
        <div className={`${ childWrapperClassName || "row justify-content-center"}`}>
          <div className="col-md-10">{children}</div>
        </div>
      </div>
    </>
  );
}
