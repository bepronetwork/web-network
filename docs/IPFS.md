## 1. IPFS

Following the decentralized mantra, files created by the application are uploaded through [IPFS](https://ipfs.io/).

Is recomended using [Infura](https://infura.io/product/ipfs) to be your file host, but you can use any other ipfs solution.


Update the .env with the IPFS values;

```text
# .env

NEXT_IPFS_PROJECT_ID=yourIpfsProjectId
NEXT_IPFS_PROJECT_SECRET=yourIpfsProjectSecret
NEXT_IPFS_UPLOAD_ENDPOINT=https://ipfs.infura.io:5001/api/v0
NEXT_PUBLIC_IPFS_BASE=https://YOUR-GATWAY-SUBDOMAIN.infura-ipfs.io/ipfs
```

