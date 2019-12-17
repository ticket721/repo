# global

Contains a global utility library in TS, used in the server, the webapp and the mobile apps.

## Address

| Function | Description |
| :---: | :---: |
| `isAddress(address: string) => boolean` | Utility to check that given argument is an ethereum address |
| `toAcceptedAddressFormat(address: string) => boolean` | Expect all address coming from anywhere on the platform to come out of this utility |

## Wallet

| Function | Description |
| :---: | :---: |
| `async createWallet() => Promise<Wallet>`| Returns an `ethers`.`Wallet` instance |
| `async encryptWallet(wallet: Wallet, password: string, cb?: ProgressCallback) => Promise<string>`| Encrypts an `ethers`.`Wallet` instance |
| `isV3EncryptedWallet(wallet: EncryptedWallet) => boolean`| Utility to check that given encrypted wallet is indeed an encrypted wallet |

## Log

| Function | Description |
| :---: | :---: |
| `setVerbosity(value: boolean)` | Set to true and all utilities will log infos |


