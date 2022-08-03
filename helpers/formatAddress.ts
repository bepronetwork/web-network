export const formatAddress = (address:  string, joiner = "...") => [address.slice(0, 4), address.slice(-4)].join(joiner)
