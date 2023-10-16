import CommentSettingsView from "./view";

export default function CommentSettings({
  handleHide,
  isGovernor,
  hidden,
  updateBountyData,
}: {
  handleHide: () => void;
  isGovernor: boolean;
  hidden: boolean;
  updateBountyData: (updatePrData?: boolean) => void;
}) {

  function handleHideComment() {
    handleHide();
    updateBountyData();
  }

  if(!isGovernor) return null;

  return (
    <CommentSettingsView
      hidden={hidden}
      onHideClick={handleHideComment}
      isGovernor={isGovernor}
    />
  );
}
