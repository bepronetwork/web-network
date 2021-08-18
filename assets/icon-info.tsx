export default function IconInfo({
  type,
  className,
}: {
  type: "info" | "warning" | "secondary";
  className?: string;
}) {
  return (
    <svg
      id={`icon-info-${type}`}
      data-name={`icon-info-${type}`}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM10 9C10.5523 9 11 9.44771 11 10V14C11 14.5523 10.5523 15 10 15C9.44771 15 9 14.5523 9 14V10C9 9.44771 9.44771 9 10 9ZM10 5C9.44771 5 9 5.44772 9 6C9 6.55228 9.44771 7 10 7H10.01C10.5623 7 11.01 6.55228 11.01 6C11.01 5.44772 10.5623 5 10.01 5H10Z"
        className={`fill-${type}`}
      />
    </svg>
  );
}
