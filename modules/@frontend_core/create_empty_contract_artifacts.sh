#! /bin/bash

if [[ -f "src/subspace/contract_artifacts.json" ]]; then
  echo "Contract Artifacts ready"
else
  echo "{}" > src/subspace/contract_artifacts.json
  echo "Created empty Contract Artifacts"
fi
