#! /bin/bash

echo "Running Global PostInstall script"

# This is an ugly script that does things after the @install is called

echo "Creating empty contract_artifacts file in @frontend_core"
echo "{}" > modules/@frontend_core/src/subspace/contract_artifacts.json
