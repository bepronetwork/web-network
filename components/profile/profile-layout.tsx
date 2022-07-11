import ConnectWalletButton from "components/connect-wallet-button";
import ProfileSide from "components/profile/profile-side";

export default function ProfileLayout({ children }) {
  return(
    <div className="pt-5">
      <ConnectWalletButton asModal={true} />
      
      <div className="row pt-4 mx-0">
        <ProfileSide />

        <div className="col-10 pt-4 px-4 profile-content">
          {children}
        </div>
      </div>
    </div>
  );
}