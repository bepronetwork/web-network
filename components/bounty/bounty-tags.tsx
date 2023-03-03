import Badge from "components/badge";

interface BountyTagsProps {
  tags: string[];
  color?: string;
  opacity?: boolean;
}

export default function BountyTags({
  tags,
  color,
  opacity = true
} : BountyTagsProps) {
  if (!tags) return <></>;
  
  return(
    <div className="d-flex gap-1">
      {tags.map(tag => 
        <Badge
          key={tag}
          label={tag} 
          className={`caption-small ${!color && "border border-primary"} border-radius-8`}
          color={opacity ? 'primary-30' : 'primary'}
          style={color ? { backgroundColor: `${color}90`, border: `1px solid ${color}` }: null}
        /> )}
    </div>
  );
}
