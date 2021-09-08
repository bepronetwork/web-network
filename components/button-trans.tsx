export default function ButtonTrans({
                                      children,
                                      className = ``,
                                      rounded = false,
                                      onClick = () => {},
                                      noAppend = false,
                                      opac = false,
                                      disabled = false
                                    }) {

  function getClasses() {
    if (noAppend)
      return className;

    let append = className;

    if (rounded)
      append += ` circle-2 p-0`;

    return `btn btn-md btn-${!opac ? `trans` : `opac`} text-uppercase ${append}`;
  }

  return <>
    <button className={getClasses()} onClick={onClick} disabled={disabled}>{children}</button>
  </>
}
