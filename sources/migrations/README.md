# migrations

Contains migration scripts for both Cassandra and ElasticSearch

## Cassandra

| Section | File | Up | Down |
| :---: | :---: | :---: | :---: |
| `user` | [`user/1576415205_create_table.js`](./cassandra/user/1576415205_create_table.js) | Creates `user` table | Drops `user` table |

## ElasticSearch

| Section | File | Up | Down |
| :---: | :---: | :---: | :---: |
| `user` | [`user/migrations/20191216075937_create_user_index.js`](./elasticsearch/user/migrations/20191216075937_create_user_index.js) | Creates `ticket721_user` index. Update `ticket721_user` mappings. | Deletes `ticket721_user` index |


