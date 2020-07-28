ARG TAG
FROM repo:${TAG} as DEPENDENCIES
FROM raw:${TAG} as BUILDER

COPY --from=DEPENDENCIES "/repo/node_modules" "/repo/node_modules"
COPY --from=DEPENDENCIES "/repo/modules/@backend_nest/node_modules" "/repo/modules/@backend_nest/node_modules"
COPY --from=DEPENDENCIES "/repo/modules/@common_sdk/node_modules" "/repo/modules/@common_sdk/node_modules"
COPY --from=DEPENDENCIES "/repo/modules/@common_global/node_modules" "/repo/modules/@common_global/node_modules"
COPY --from=DEPENDENCIES "/repo/modules/@common_geoloc/node_modules" "/repo/modules/@common_geoloc/node_modules"
COPY --from=DEPENDENCIES "/repo/modules/@frontend_staff-app/node_modules" "/repo/modules/@frontend_staff-app/node_modules"
COPY --from=DEPENDENCIES "/repo/modules/@frontend_core/node_modules" "/repo/modules/@frontend_core/node_modules"
COPY --from=DEPENDENCIES "/repo/modules/@frontend_flib-react/node_modules" "/repo/modules/@frontend_flib-react/node_modules"

WORKDIR "/repo/modules/@frontend_staff-app"

ENV NODE_ENV production
ENV GENERATE_SOURCEMAP false

RUN cd ../@common_global && yarn build \
 && cd ../@common_geoloc && yarn build \
 && cd ../@common_sdk && yarn build \
 && cd ../@frontend_flib-react && yarn build \
 && cd ../@frontend_core && yarn build \
 && cd ../@frontend_staff-app && yarn build:prod

CMD ["yarn", "inject_env_and_serve"]

