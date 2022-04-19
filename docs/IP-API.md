## 1. IP-API

In some countries dApp are [*illegal*](https://medium.com/the-capital/decentralized-apps-dapps-legal-implications-questions-and-opportunities-5aa1eba0c3a), therefore you can use [IP Api](ip-api.com) to identify and block connections from specific origin/region.

By default this validation is skipped, but if you prefer can change `NEXT_SKIP_IP_API` to `false`, in `NEXT_PUBLIC_COUNTRY_CODE_BLOCKED` set the countrys code to be blocked, and if you buy pro version, can set de key in `NEXT_IP_API_KEY`.

```text
# .env
NEXT_PUBLIC_COUNTRY_CODE_BLOCKED=["US", "SA"]

NEXT_IP_API_KEY=youApiApiKey
NEXT_SKIP_IP_API=false
```

