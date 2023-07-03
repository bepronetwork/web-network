export default function ItemRowIdView({
  className,
  id,
}: {
  id: string | number;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="label-m text-gray-500">#{id}</span>
    </div>
  );
}
