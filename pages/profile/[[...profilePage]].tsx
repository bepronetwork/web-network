import Profile, {
  getServerSideProps as profileGetServerSideProps
} from "pages/[network]/[chain]/profile/[[...profilePage]]";

export default Profile;

export const getServerSideProps = profileGetServerSideProps;
