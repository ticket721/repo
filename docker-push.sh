# Login
docker login docker.pkg.github.com --username mortimr --password ${GITHUB_TOKEN}

# Tags
docker tag server:${TAG} docker.pkg.github.com/phanatic/repo/server:${TAG}
docker tag worker:${TAG} docker.pkg.github.com/phanatic/repo/worker:${TAG}

# Push
docker push docker.pkg.github.com/phanatic/repo/server:${TAG}
docker push docker.pkg.github.com/phanatic/repo/worker:${TAG}



