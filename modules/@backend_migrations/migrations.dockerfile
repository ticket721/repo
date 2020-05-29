ARG TAG
FROM repo:${TAG} as DEPENDENCIES
FROM raw:${TAG} as BUILDER

COPY --from=DEPENDENCIES "/repo/node_modules" "/repo/node_modules"
COPY --from=DEPENDENCIES "/repo/modules/@backend_migrations/node_modules" "/repo/modules/@backend_migrations/node_modules"

WORKDIR "/repo/modules/@backend_migrations"

CMD ["./migrate.sh"]

