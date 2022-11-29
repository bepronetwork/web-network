export const truncateAddress = (address,
  left = 6,
  right = 4,
  separator = "...") => [address?.substring(0, left), separator, address?.substr(-right)].join("");
