import ArrowUp from '@assets/icons/arrow-up'
import ArrowDown from '@assets/icons/arrow-down'

export default function NetworkListBarColumn({
  hideOrder = false,
  isColumnActive,
  columnOrder = 'asc',
  label,
  onClick = () => {}
}) {
  const textClass = hideOrder ? 'text-primary' : ''
  const ArrowComponent =
    columnOrder === 'desc' || !isColumnActive ? (
      <ArrowDown width={9.33} height={6.22} />
    ) : (
      <ArrowUp width={9.33} height={6.22} />
    )

  return (
    <div
      className={`col-3 d-flex flex-row justify-content-center cursor-pointer align-items-center ${
        isColumnActive ? 'text-primary' : textClass
      }`}
      onClick={onClick}
    >
      <span className="caption-medium mr-1">{label}</span>
      {(!hideOrder && ArrowComponent) || <></>}
    </div>
  )
}
