FROM node:12

RUN mkdir /repo
WORKDIR /repo
COPY . /repo

RUN yarn global add lerna portalize

