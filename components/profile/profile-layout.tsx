import ConnectWalletButton from "components/connect-wallet-button";
import ProfileSide from "components/profile/profile-side";

export default function ProfileLayout({ children, childrenClassName = "" }) {
  return (
    <>
      <ConnectWalletButton asModal={true} />

      <div className="row mx-0 h-100">
        <ProfileSide />

        <div
          className={`col-12 col-xl-10 p-3 p-xl-5 profile-content bg-gray-950 ${childrenClassName}`}
        >
          {children}
        </div>
      </div>
    </>
  );
}
