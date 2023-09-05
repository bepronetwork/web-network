import ResponsiveWrapper from "components/responsive-wrapper";

export function ContainerTypeFlex({ children }) {
  const CLASS = "d-flex border-top border-gray-700 py-3 px-2";

  return (
    <>
      <ResponsiveWrapper
        xs={true}
        md={false}
        className={`${CLASS} flex-column`}
      >
        {children}
      </ResponsiveWrapper>
      <ResponsiveWrapper xs={false} md={true} className={CLASS}>
        {children}
      </ResponsiveWrapper>
    </>
  );
}
