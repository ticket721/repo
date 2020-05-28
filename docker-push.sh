# Login
gcloud auth configure-docker

# Tags
docker tag server:${TAG} ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/server:${TAG}
docker tag worker:${TAG} ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/worker:${TAG}

# Push
docker push ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/server:${TAG}
docker push ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/worker:${TAG}



