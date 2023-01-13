import Badge from "components/badge";

interface BountyTagsProps {
  tags: string[];
}

export default function BountyTags({
  tags
} : BountyTagsProps) {
  if (!tags) return <></>;
  
  return(
    <div className="d-flex gap-1">
      {tags.map(tag => 
        <Badge
          key={tag}
          label={tag} 
          className="caption-small border border-primary border-radius-8" 
          color="primary-30"
        /> )}
    </div>
  );
}