import Badge from "components/badge";

interface BountyTagsProps {
  tags: string[];
}

export default function BountyTagsView({
  tags
}: BountyTagsProps) {
  if (!tags) return <></>;

  return (
    <div className="d-flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge
          key={tag}
          label={tag}
          className={`caption-medium border border-gray-800
           border-radius-4 text-uppercase text-white-40`}
          color="bg-gray"
        />
      ))}
    </div>
  );
}