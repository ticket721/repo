#! /bin/bash

sqlite3 worldcities.sqlite ".read ./create_db_from_csv.sql"
