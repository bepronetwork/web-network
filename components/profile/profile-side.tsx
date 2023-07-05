import ProfileLinks from "components/profile/profile-links";
import ResponsiveWrapper from "components/responsive-wrapper";

export default function ProfileSide() {
  return (
    <ResponsiveWrapper
      xl={true}
      xs={false}
      className="col-2 bg-gray-950"
    >
      <div className="ml-2 pt-4 w-100">
        <ProfileLinks />
      </div>
    </ResponsiveWrapper>
  );
}
