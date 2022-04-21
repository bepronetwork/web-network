## 1. HOW MANAGER MY NETWORK?

The admin wallet is the address of the contracts governor, this person will be able to access the `/parity` page where actions for deploying ERC20 and Network are available.

 -  Default Network Name.
 -  Min and Max time for dispute.
 -  Min and Max Ammount to be a Council Member.
 -  Max dispute Percentage.

```
text
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

Create other networks by visiting `/networkname/account/my-network`