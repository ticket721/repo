# geoloc

This module contains tools and utility to generate the cities database for the `global` module.


## Create SQLITE database from csv

First, add the file with the name `worldcities.csv`. Then run:

```bash
./create_db_from_csv.sh
```

## Create JSON file for the `global` module

```bash
ts-node ./sources/converter.ts ./worldcities.sqlite ../@common_global/sources/geoloc/cities.json
```

