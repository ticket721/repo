# Login
gcloud auth configure-docker

# Tags
docker tag server:${TAG} ${GCP_REGISTRY_HOSTNAME}/${GCP_PROJECT_ID}/server:${TAG}
docker tag worker:${TAG} ${GCP_REGISTRY_HOSTNAME}/${GCP_PROJECT_ID}/worker:${TAG}

# Push
docker push ${GCP_REGISTRY_HOSTNAME}/${GCP_PROJECT_ID}/server:${TAG}
docker push ${GCP_REGISTRY_HOSTNAME}/${GCP_PROJECT_ID}/worker:${TAG}



