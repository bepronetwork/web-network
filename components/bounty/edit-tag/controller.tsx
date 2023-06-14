import { TAGS_OPTIONS } from "helpers/tags-options";

import BountyEditTagView from "./view";

interface BountyEditTagProps {
  isEdit: boolean;
  selectedTags: string[];
  setSelectedTags: (v: string[]) => void;
  preview?: boolean;
}

export default function BountyEditTag({
  selectedTags,
  setSelectedTags,
  isEdit = false,
  preview = false,
}: BountyEditTagProps) {

  function handleChangeTags(newTags) {
    setSelectedTags(newTags.map(({ value }) => value));
  }

  return (
    <BountyEditTagView
      tagsOptions={TAGS_OPTIONS}
      handleChangeTags={handleChangeTags}
      selectedTags={selectedTags}
      preview={preview}
      isEdit={isEdit}
    />
  );
}
