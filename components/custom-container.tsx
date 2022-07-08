export default function CustomContainer({ children, className = undefined, className2 = undefined }) {
  return (
    <>
      <div className={`container ${className || ""}`}>
        <div className={`${ className2 || "row justify-content-center"}`}>
          <div className="col-md-10">{children}</div>
        </div>
      </div>
    </>
  );
}
