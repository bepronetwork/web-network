import Badge from "components/badge";

interface BountyTagsProps {
  tags: string[];
  color?: string;
}

export default function BountyTags({
  tags,
  color,
} : BountyTagsProps) {
  if (!tags) return <></>;
  
  return(
    <div className="d-flex gap-1">
      {tags.map(tag => 
        <Badge
          key={tag}
          label={tag} 
          className="caption-small border-radius-8" 
          color="primary" 
          style={color ? { backgroundColor: color }: null}
        /> )}
    </div>
  );
}