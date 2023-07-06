interface ListHeaderProps {
  columns: string[];
}

export default function ListHeader({
  columns
}: ListHeaderProps) {

  function renderListBarColumn(label: string, key: number) {
    return (
      <div
        key={`${key}-${label}`}
        className={`d-flex flex-row col justify-content-center  align-items-center 
        text-gray`}
      >
        <span className="caption-medium text-center">{label}</span>
      </div>
    );
  }

  return (
    <div className="row pb-0 pt-2 mb-2 svg-with-text-color">
      {columns.map(renderListBarColumn)}
    </div>
  );
}
