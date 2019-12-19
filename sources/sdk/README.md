# sdk

The T721SDK contains all the methods to communicate with the Server.

## App

| Name | Route | Method | Extra Infos|
| :---: | :---: | :---: | :---:
| [`getAPIInfos`](./sources/app/app.ts#L4) | `/` | `GET` | |

## Authentication

| Name | Route | Method | Extra Infos|
| :---: | :---: | :---: | :---:
| [`localRegister`](./sources/app/api/authentication.ts#L28) | `/authentication/local/register` | `POST` | |
| [`localLogin`](./sources/app/api/authentication.ts#L64) | `/authentication/local/login` | `POST` | |
| [`web3Register`](./sources/app/api/authentication.ts#L28) | `/authentication/web3/register` | `POST` | Use `web3RegisterPayload` to generate the payload that should be signed and sent |
| [`web3Login`](./sources/app/api/authentication.ts#L64) | `/authentication/web3/login` | `POST` | Use `web3LoginPayload` to generate the payload that should be signed and sent |



