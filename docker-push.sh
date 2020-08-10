# Tags
docker tag server:${TAG} ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/server:${TAG}
docker tag worker:${TAG} ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/worker:${TAG}
docker tag migrations:${TAG} ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/migrations:${TAG}
docker tag organizer:${TAG} ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/organizer:${TAG}
docker tag t721app:${TAG} ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/t721app:${TAG}
docker tag staff:${TAG} ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/staff:${TAG}

# Push
docker push ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/server:${TAG}
docker push ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/worker:${TAG}
docker push ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/migrations:${TAG}
docker push ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/organizer:${TAG}
docker push ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/t721app:${TAG}
docker push ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ticket721/staff:${TAG}
