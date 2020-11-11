#! /bin/bash

   ./find-ecr-image.sh ticket721/server ${TAG} \
&& ./find-ecr-image.sh ticket721/migrations ${TAG} \
&& ./find-ecr-image.sh ticket721/organizer ${TAG} \
&& ./find-ecr-image.sh ticket721/t721app ${TAG} \
&& ./find-ecr-image.sh ticket721/staff ${TAG} \

if [ $? -eq 1 ]; then
  echo "::set-output name=should_build::true"
else
  echo "::set-output name=should_build::false"
fi
