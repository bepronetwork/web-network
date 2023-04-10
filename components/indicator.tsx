export default function Indicator({ bg = "gray", size = "sm" }) {
  const sizes = {
    sm: ".5rem",
    md: "1rem",
    lg: "1.5rem"
  };

  return (
    <>
      <span
        className="d-inline-block me-2 rounded-circle"
        style={{
          height: sizes[size],
          width: sizes[size],
          backgroundColor: bg || "transparent"
        }}
      />
    </>
  );
}
