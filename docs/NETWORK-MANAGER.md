## 1. HOW CREATE/MANAGER MY NETWORK?

Each user is be able to create other networks by visiting `/networkname/account/my-network`

After created also be able to manege settings of you own networks by visiting `/networkname/profile/my-network`

> <img align="center" src="./docs/assets/network-settings-page.png" width="500"/>

## 2. HOW MANAGER DEFAULT SETTINGS NETWORK?

Only the contracts governor is able to access the `/administration` page. There is possible to change the default settings for ERC20 and Network contracts for new network deployed.

- Default Network Name.
- Min and Max time for dispute.
- Min and Max Ammount to be a Council Member.
- Max dispute Percentage.

It is also possible to change these settings in the env file before doing the first deploy.

```
# .env

NEXT_PUBLIC_DEFAULT_NETWORK_NAME=bepro
NEXT_PUBLIC_DISPUTABLE_TIME_MIN=60
NEXT_PUBLIC_DISPUTABLE_TIME_MAX=20*24*60*60
NEXT_PUBLIC_REDEEM_TIME_MIN=60
NEXT_PUBLIC_REDEEM_TIME_MAX=20*24*60*60
NEXT_PUBLIC_COUNCIL_AMOUNT_MIN=100001
NEXT_PUBLIC_COUNCIL_AMOUNT_MAX=50000000
NEXT_PUBLIC_DISPUTE_PERCENTAGE_MAX=15
NEXT_PUBLIC_NETWORK_FACTORY_ADDRESS=
```
