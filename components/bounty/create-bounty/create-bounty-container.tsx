import ResponsiveWrapper from "components/responsive-wrapper";

export default function CreateBountyContainer({ children }) {
  return (
    <>
      <ResponsiveWrapper
        xs={true}
        md={false}
        className="flex-column justify-content-between bg-gray-900 border-radius-4 border border-gray-850 min-vh-90"
      >
        {children}
      </ResponsiveWrapper>
      <ResponsiveWrapper xs={false} md={true} className="flex-column">
        {children}
      </ResponsiveWrapper>
    </>
  );
}
