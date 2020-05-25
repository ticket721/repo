ARG TAG
FROM repo:${TAG} as DEPENDENCIES
FROM raw:${TAG} as BUILDER

COPY --from=DEPENDENCIES "/repo/node_modules" "/repo/node_modules"
COPY --from=DEPENDENCIES "/repo/modules/@backend_nest/node_modules" "/repo/modules/@backend_nest/node_modules"
COPY --from=DEPENDENCIES "/repo/modules/@common_global/node_modules" "/repo/modules/@common_global/node_modules"

WORKDIR "/repo/modules/@backend_nest"

RUN cd ../@common_global\
 && yarn build\
 && cd ../@backend_nest\
 && yarn build:worker

CMD ["node", "dist/apps/worker/apps/worker/src/main.js"]

