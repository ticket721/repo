#!/usr/bin/env bash
# Example:
#    ./find-ecr-image.sh foo/bar mytag

if [[ $# -lt 2 ]]; then
    echo "Usage: $( basename $0 ) <repository-name> <image-tag>"
    exit 1
fi

IMAGE_META="$( aws ecr describe-images --repository-name=$1 --image-ids=imageTag=$2 2> /dev/null )"

if [[ $? == 0 ]]; then
    IMAGE_TAGS="$( echo ${IMAGE_META} | jq '.imageDetails[0].imageTags[0]' -r )"
    echo "$1:$2 found"
else
    echo "$1:$2 not found"
    exit 1
fi
