import TrashIcon from "../../../../assets/icons/trash-icon";

interface PermissionsItemProps {
  value: string;
  id: number;
  onTrashClick: (v: string) => void;
}

export default function PermissionListItem({
  value,
  id,
  onTrashClick,
}: PermissionsItemProps) {
  const CARD_CLASS = "bg-gray-900 border border-gray-800 border-radius-4 p-2";

  return (
    <div
      className={`d-flex align-items-center justify-content-between my-2 col-md-5 col-12 ${CARD_CLASS}`}
      key={`${value}-${id}`}
    >
      <div>
        <div className="p ms-1">{value}</div>
      </div>
      <div>
        <div className="cursor-pointer" onClick={() => onTrashClick(value)}>
          <TrashIcon viewBox="0 0 32 32" />
        </div>
      </div>
    </div>
  );
}
