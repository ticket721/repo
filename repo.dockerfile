ARG TAG
FROM raw:${TAG}

RUN yarn @clean\
 && yarn @install:prod

