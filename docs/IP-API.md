## 1. IP-API

In some countries decentralized applications are [*illegal*](https://medium.com/the-capital/decentralized-apps-dapps-legal-implications-questions-and-opportunities-5aa1eba0c3a), therefore you can use [IP Api](ip-api.com) to identify and block connections from specific origin/region.

*note: ip-api.com needs http or it will point to a same-page link*

By default this validation is made, but can be disabled via the following environment variables;

```text
# .env

# WILL NOT SKIP
NEXT_SKIP_IP_API=false

# WILL SKIP
NEXT_SKIP_IP_API=true

# COUNTRIES CODE WITH RESTRICTION
NEXT_PUBLIC_COUNTRY_CODE_BLOCKED=["US", "SA"]

# IP API PRO KEY
NEXT_IP_API_KEY=youApiApiKey
```
