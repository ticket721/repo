#! /bin/bash

docker run --rm --name t721-elassandra -p 32702:9042 -p 32610:9200 strapdata/elassandra:6.8.4.0
