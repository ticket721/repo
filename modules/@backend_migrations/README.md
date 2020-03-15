# migrations

Contains migration scripts for both Cassandra and ElasticSearch

## Cassandra

| Section | File | Up | Down |
| :---: | :---: | :---: | :---: |
| `user` | [`1576415205_create_user_table.js`](./cassandra/1576415205_create_user_table.js) | Creates `user` table | Drops `user` table |
| `web3token` | [`1576924519_create_web3token_table`](./cassandra/1576924519_create_web3token_table.js) | Creates `web3token` table | Drops `web3token` table |

## ElasticSearch

| Section | File | Up | Down |
| :---: | :---: | :---: | :---: |
| `user` | [`migrations/20191216075937_create_user_index.js`](./elasticsearch/migrations/20191216075937_create_user_index.js) | Creates `ticket721_user` index. Update `ticket721_user` mappings. | Deletes `ticket721_user` index |
| `web3token` | [`migrations/20191221103957_create_web3token_index.js`](./elasticsearch/migrations/20191221103957_create_web3token_index.js) | Creates `ticket721_web3token` index. Update `ticket721_web3token` mappings. | Deletes `ticket721_web3token` index |



