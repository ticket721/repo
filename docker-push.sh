# Login
docker login docker.pkg.github.com --username mortimr --password ${GITHUB_TOKEN}

# Tags
docker tag server:${TAG} docker.pkg.github.com/ticket721/repo/server:${TAG}
docker tag worker:${TAG} docker.pkg.github.com/ticket721/repo/worker:${TAG}

# Push
docker push docker.pkg.github.com/ticket721/repo/server:${TAG}
docker push docker.pkg.github.com/ticket721/repo/worker:${TAG}



