
import ProfileLinks from "components/profile/profile-links";

export default function ProfileSide() {

  return(
    <aside className="col-2 bg-gray-950">
      <div className="ml-2 pt-4">
        <ProfileLinks />
      </div>
    </aside>
  );
}