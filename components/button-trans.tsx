export default function ButtonTrans({children, className = ``, rounded = false, onClick = () => {}, noAppend = false}) {

  function getClasses() {
    if (noAppend)
      return className;

    let append = className;

    if (rounded)
      append += ` circle-2 p-0`;

    return `btn btn-md btn-trans ${append}`;
  }

  return <>
    <button className={getClasses()} onClick={onClick}>{children}</button>
  </>
}
