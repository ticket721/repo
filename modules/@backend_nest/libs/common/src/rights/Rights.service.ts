import { CRUDExtension, CRUDResponse, DryResponse, SearchQuery } from '@lib/common/crud/CRUDExtension.base';
import {
    BaseModel,
    Connection,
    InjectConnection,
    InjectModel,
    InjectRepository,
    Repository,
} from '@iaminfinity/express-cassandra';
import { RightEntity } from '@lib/common/rights/entities/Right.entity';
import { RightsRepository } from '@lib/common/rights/Rights.repository';
import { UserDto } from '@lib/common/users/dto/User.dto';
import _ from 'lodash';
import { ModuleRef } from '@nestjs/core';
import { RightsConfig } from '@lib/common/rights/RightsConfig.type';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

/**
 * Service to CRUD RightEntities
 */
export class RightsService extends CRUDExtension<RightsRepository, RightEntity> {
    /**
     * Dependency injection
     *
     * @param rightsRepository
     * @param rightEntity
     * @param connection
     * @param moduleRef
     */
    constructor(
        @InjectRepository(RightsRepository)
        rightsRepository: RightsRepository,
        @InjectModel(RightEntity)
        rightEntity: BaseModel<RightEntity>,
        @InjectConnection() private readonly connection: Connection,
        private readonly moduleRef: ModuleRef,
    ) {
        super(
            rightEntity,
            rightsRepository,
            /* istanbul ignore next */
            (e: RightEntity) => {
                return new rightEntity(e);
            },
            /* istanbul ignore next */
            (r: RightEntity) => {
                return new RightEntity(r);
            },
        );
    }

    /**
     * Utility to verify if user has global rights upon entity / entities
     *
     * @param service
     * @param user
     * @param entityValue
     * @param requiredRights
     */
    async hasGlobalRightsUpon<RepositoryType, EntityType>(
        service: CRUDExtension<Repository<EntityType>, EntityType>,
        user: UserDto,
        entityValue: string,
        requiredRights: string[],
    ): Promise<CRUDResponse<void>> {
        const entityName: string = service.name;

        let rightsConfig: RightsConfig;

        try {
            rightsConfig = await this.moduleRef.get(`@rights/${entityName}`, { strict: false });
        } catch (e) {
            return {
                error: 'cannot_find_config',
                response: null,
            };
        }

        for (const reqRight of requiredRights) {
            if (rightsConfig[reqRight].public) {
                return {
                    error: null,
                    response: null,
                };
            }
        }

        const rightsQuery = await this.search({
            grantee_id: user.id,
            entity_type: entityName,
            entity_value: entityValue,
        });

        if (rightsQuery.error) {
            return {
                error: rightsQuery.error,
                response: null,
            };
        }

        if (rightsQuery.response.length === 0) {
            return {
                error: 'rights_not_found',
                response: null,
            };
        }

        const right: RightEntity = rightsQuery.response[0];

        const resolvedRights = await this.getAllRights(rightsConfig, right);

        let found = false;

        for (const rightKey of resolvedRights) {
            if (requiredRights.indexOf(rightKey) !== -1) {
                found = true;
            }
        }

        if (!found) {
            return {
                error: 'unauthorized',
                response: null,
            };
        }

        return {
            error: null,
            response: null,
        };
    }

    /**
     * Recursively resolves the rights of the right entity
     *
     * @param right
     * @param rightsConfig
     * @param met
     */
    private async recursiveResolver(
        right: string,
        rightsConfig: RightsConfig,
        met: { [key: string]: boolean },
    ): Promise<string[]> {
        if (met[right] === true) {
            return [];
        }

        let ret = [right];

        if (rightsConfig[right].countAs) {
            for (const countAsRight of rightsConfig[right].countAs) {
                ret = [...ret, ...(await this.recursiveResolver(countAsRight, rightsConfig, met))];
            }
        }

        met[right] = true;

        return ret;
    }

    /**
     * Returns the right config for given entity
     *
     * @param entityName
     */
    async getRightsConfig(entityName: string): Promise<ServiceResponse<RightsConfig>> {
        try {
            return {
                error: null,
                response: await this.moduleRef.get(`@rights/${entityName}`, { strict: false }),
            };
        } catch (e) {
            return {
                error: 'cannot_find_config',
                response: null,
            };
        }
    }

    /**
     * Returns all rights of the right entity
     *
     * @param rightsConfig
     * @param rightEntity
     */
    async getAllRights(rightsConfig: RightsConfig, rightEntity: RightEntity): Promise<string[]> {
        let rights = [];
        const met = {};

        for (const right of Object.keys(rightEntity.rights)) {
            rights = [...rights, ...(await this.recursiveResolver(right, rightsConfig, met))];
        }

        rights = rights.filter((val: string, idx: number): boolean => rights.indexOf(val) === idx);

        return rights;
    }

    /**
     * Utility to verify if user has rights upon entities
     *
     * @param service
     * @param user
     * @param query
     * @param field
     * @param requiredRights
     */
    async hasRightsUpon<RepositoryType, EntityType>(
        service: CRUDExtension<Repository<EntityType>, EntityType>,
        user: UserDto,
        query: SearchQuery<EntityType>,
        field: string,
        requiredRights: string[],
    ): Promise<CRUDResponse<EntityType[]>> {
        const entityName: string = service.name;

        let rightsConfig: RightsConfig;

        try {
            rightsConfig = await this.moduleRef.get(`@rights/${entityName}`, { strict: false });
        } catch (e) {
            return {
                error: 'cannot_find_config',
                response: null,
            };
        }

        for (const reqRight of requiredRights) {
            if (rightsConfig[reqRight].public) {
                return {
                    error: null,
                    response: [],
                };
            }
        }

        const entityQuery = await service.search(query);

        if (entityQuery.error) {
            return {
                error: entityQuery.error,
                response: null,
            };
        }

        if (entityQuery.response.length === 0) {
            return {
                error: 'entity_not_found',
                response: null,
            };
        }

        for (const entity of entityQuery.response) {
            const entityValue: any = _.get(entity, field);

            const rightsQuery = await this.search({
                grantee_id: user.id,
                entity_type: entityName,
                entity_value: entityValue,
            });

            if (rightsQuery.error) {
                return {
                    error: rightsQuery.error,
                    response: null,
                };
            }

            if (rightsQuery.response.length === 0) {
                return {
                    error: 'rights_not_found',
                    response: null,
                };
            }

            const right: RightEntity = rightsQuery.response[0];

            const resolvedRights = await this.getAllRights(rightsConfig, right);

            let found = false;

            for (const rightKey of resolvedRights) {
                if (requiredRights.indexOf(rightKey) !== -1) {
                    found = true;
                }
            }

            if (!found) {
                return {
                    error: 'unauthorized',
                    response: null,
                };
            }
        }

        return {
            error: null,
            response: entityQuery.response,
        };
    }

    /**
     * Returns number of rights for given parameters
     *
     * @param entity
     * @param entityValue
     * @param right
     */
    private async getRightCount(entity: string, entityValue: string, right: string): Promise<number> {
        const esQuery = {
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    entity_type: entity,
                                },
                            },
                            {
                                term: {
                                    entity_value: entityValue,
                                },
                            },
                            {
                                nested: {
                                    path: 'rights',
                                    query: {
                                        bool: {
                                            must: {
                                                term: {
                                                    [`rights.${right}`]: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        };

        const query = await this.searchElastic(esQuery);

        if (query.error) {
            throw new Error(`internal_fetch_error`);
        }

        return query.response.hits.total;
    }

    /**
     * Verify rights based on entity config
     *
     * @param entity
     * @param entityValue
     * @param rights
     * @param rightsConfig
     */
    private async verifyRights(
        entity: string,
        entityValue: string,
        rights: { [key: string]: boolean },
        rightsConfig: RightsConfig,
    ): Promise<void> {
        for (const right of Object.keys(rights)) {
            // 1 Check that the right actually exists

            if (rightsConfig[right] === undefined) {
                throw new Error(`unknown_right`);
            }

            // 2 Check if count restriction

            if (rightsConfig[right].count !== undefined) {
                const count = await this.getRightCount(entity, entityValue, right);

                if (count >= rightsConfig[right].count) {
                    throw new Error(`maximum_right_count_reached`);
                }
            }
        }
    }

    /**
     * Create set of rights for a given user
     *
     * @param user
     * @param rights
     */
    async addRights(
        user: UserDto,
        rights: {
            entity: string;
            entityValue: string;
            rights: { [key: string]: boolean };
        }[],
    ): Promise<CRUDResponse<any>> {
        const dryResponses: DryResponse[] = [];

        for (const right of rights) {
            let rightsConfig: RightsConfig;

            try {
                try {
                    rightsConfig = await this.moduleRef.get(`@rights/${right.entity}`, { strict: false });
                } catch (e) {
                    throw new Error('cannot_find_config');
                }
                await this.verifyRights(right.entity, right.entityValue, right.rights, rightsConfig);
            } catch (e) {
                return {
                    error: e.message,
                    response: null,
                };
            }

            const createdRightQuery = await this.dryCreate({
                grantee_id: user.id,
                entity_type: right.entity,
                entity_value: right.entityValue,
                rights: right.rights,
            } as Partial<RightEntity>);

            if (createdRightQuery.error) {
                return {
                    error: createdRightQuery.error,
                    response: null,
                };
            }

            dryResponses.push(createdRightQuery.response);
        }

        try {
            const res = await this.connection.doBatchAsync(dryResponses as any);
            return {
                error: null,
                response: res,
            };
        } catch (e) {
            return {
                error: 'internal_batch_query_error',
                response: null,
            };
        }
    }
}
