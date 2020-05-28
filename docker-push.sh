# Tags
docker tag server:${TAG} ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/server:${TAG}
docker tag worker:${TAG} ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/worker:${TAG}

# Push
docker push ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/server:${TAG}
docker push ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/worker:${TAG}



