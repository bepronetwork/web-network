export function messageFor(chainId, contents = "Hello, world") {
  return JSON.stringify({
    domain: {
      chainId: +chainId,
      name: 'BEPRO-Message',
      version: '1',
    },
    message: {
      contents,
    },
    primaryType: 'Message',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
      ],
      Message: [
        {name: 'contents', type: 'string'}
      ]
    }
  })
}