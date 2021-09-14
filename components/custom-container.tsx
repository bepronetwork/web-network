export default function CustomContainer({children}) {
  return <>
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-10">{children}</div>
      </div>
    </div>
  </>
}
