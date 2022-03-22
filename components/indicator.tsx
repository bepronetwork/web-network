export default function Indicator({ bg = "", border = false }) {
  return (
    <>
      <span
        className="d-inline-block me-2 rounded"
        style={{
          height: ".5rem",
          width: ".5rem",
          backgroundColor: bg || "transparent"
        }}
      />
    </>
  );
}
