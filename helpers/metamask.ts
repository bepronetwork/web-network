export const identifierNeworkLabel = (chainId: number | string) => {
    // To identifier more Networks, visite: 
    // https://chainlist.org/
    switch (Number(chainId)) {
        case 1:
            return 'Mainnet'
        case 3:
            return 'Ropsten'
        case 4:
            return 'Rinkeby'
        case 5:
            return 'Goerli'
        case 42:
            return 'Kovan'
        case 1284:
            return 'Moonbeam'
        default:
            return ''
    }
}