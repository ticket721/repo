#! /bin/bash

aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_USER_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
