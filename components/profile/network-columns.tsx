import NetworkListBarColumn from "components/networks-list/network-list-bar-column";

export default function NetworkColumns({ columns }: { columns: string[] }) {
  return (
    <div className="row justify-content-start mb-2 svg-with-text-color">
      {columns?.map((item, key) => (
        <NetworkListBarColumn
          key={key}
          className={`d-flex justify-content-${key === 0 ? 'start ms-2': 'center ms-1 '}`}
          label={item}
          hideOrder={true}
          columnOrder={item}
          isColumnActive={false}
          labelWhite={true}
        />
      ))}
    </div>
  );
}
