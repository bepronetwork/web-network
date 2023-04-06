export function Divider({ bg = "disabled" }) {
  return(
    <div className="mt-2 mb-2">
      <hr className={`bg-${bg}`} />
    </div>
  );
}