import { EsSearchOptionsStatic, Repository, SaveOptionsStatic } from '@iaminfinity/express-cassandra';
import { ESSearchBodyBuilder } from '@lib/common/utils/ESSearchBodyBuilder.helper';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { HttpException } from '@nestjs/common';
import {
    CRUDExtension,
    CRUDResponse,
    SearchOptions,
    SearchQuery,
    UpdateOptions,
} from '@lib/common/crud/CRUDExtension.base';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { fromES } from '@lib/common/utils/fromES.helper';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { RightsService } from '@lib/common/rights/Rights.service';
import { ESSearchHit } from '@lib/common/utils/ESSearchReturn.type';
import { RightEntity } from '@lib/common/rights/entities/Right.entity';
import { Boundable } from '@lib/common/utils/Boundable.type';

/**
 * Controller Basics, contains most methods used in controllers
 */
export class ControllerBasics<EntityType> {
    /**
     * Helper to use entity binding system
     *
     * @param service
     * @param id
     * @param entity
     * @param entityId
     * @private
     */
    public async _bind<CustomEntityType = EntityType>(
        service: Boundable<CustomEntityType>,
        id: string,
        entity: string,
        entityId: string,
    ): Promise<CustomEntityType> {
        const boundRes = await service.bind(id, entity, entityId);

        if (boundRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: boundRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return boundRes.response;
    }

    /**
     * Wrap crud response and throw hhtp error on any error with given code
     *
     * @param promise
     * @param errorStatus
     * @private
     */
    public async _crudCall<ResType = any>(
        promise: Promise<CRUDResponse<ResType>>,
        errorStatus: StatusCodes,
    ): Promise<ResType> {
        const res = await promise;

        if (res.error) {
            throw new HttpException(
                {
                    status: errorStatus,
                    message: res.error,
                },
                errorStatus,
            );
        }

        return res.response;
    }

    /**
     * Wrap service call and throw hhtp error on any error with given code
     *
     * @param promise
     * @param errorStatus
     * @private
     */
    public async _serviceCall<ResType = any>(
        promise: Promise<ServiceResponse<ResType>>,
        errorStatus: StatusCodes,
    ): Promise<ResType> {
        const res = await promise;

        if (res.error) {
            throw new HttpException(
                {
                    status: errorStatus,
                    message: res.error,
                },
                errorStatus,
            );
        }

        return res.response;
    }

    /**
     * Helper to use entity unbinding system
     *
     * @param service
     * @param id
     * @private
     */
    public async _unbind<CustomEntityType = EntityType>(
        service: Boundable<CustomEntityType>,
        id: string,
    ): Promise<CustomEntityType> {
        const unboundRes = await service.unbind(id);

        if (unboundRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: unboundRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return unboundRes.response;
    }

    /**
     * Generic search query, able to throw HttpExceptions
     *
     * @param service
     * @param rightsService
     * @param user
     * @param field
     * @param query
     */
    public async _searchRestricted(
        service: CRUDExtension<Repository<EntityType>, EntityType>,
        rightsService: RightsService,
        user: UserDto,
        field: string,
        query: SortablePagedSearch,
    ): Promise<EntityType[]> {
        const entityName = service.name;

        const restrictionEsQuery = {
            body: {
                size: 2147483647, // int max value
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    entity_type: entityName,
                                },
                            },
                            {
                                term: {
                                    grantee_id: user.id,
                                },
                            },
                        ],
                    },
                },
            },
        };

        const restrictionsRes = await rightsService.searchElastic(restrictionEsQuery);

        if (restrictionsRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: restrictionsRes,
                },
                StatusCodes.InternalServerError,
            );
        }

        const aggregatedFields = restrictionsRes.response.hits.hits.map(
            (esh: ESSearchHit<RightEntity>): any => esh._source.entity_value,
        );

        if (query[field] && query[field].$in) {
            for (const value of query[field]) {
                if (aggregatedFields.findIndex((agg: any): boolean => agg === value) === -1) {
                    throw new HttpException(
                        {
                            status: StatusCodes.Unauthorized,
                            message: 'unauthorized_value_in_filter',
                        },
                        StatusCodes.Unauthorized,
                    );
                }
            }
        }

        if (!query[field]) {
            query[field] = {
                $in: aggregatedFields,
            };
        } else {
            query[field].$in = aggregatedFields;
        }

        const es: ServiceResponse<Partial<EsSearchOptionsStatic>> = ESSearchBodyBuilder(query);

        /**
         * Handle Query Builder errors
         */
        if (es.error) {
            switch (es.error) {
                case 'page_index_without_page_size': {
                    throw new HttpException(
                        {
                            status: StatusCodes.BadRequest,
                            message: es.error,
                        },
                        StatusCodes.BadRequest,
                    );
                }
            }
        }

        const searchResults = await service.searchElastic(es.response);

        /**
         * Handle Request errors
         */
        if (searchResults.error) {
            switch (searchResults.error) {
                default: {
                    throw new HttpException(
                        {
                            status: StatusCodes.InternalServerError,
                            message: searchResults.error,
                        },
                        StatusCodes.InternalServerError,
                    );
                }
            }
        }

        if (searchResults.response.hits.total !== 0) {
            return searchResults.response.hits.hits.map(fromES);
        }

        return [];
    }

    /**
     * Generic search query, able to throw HttpExceptions
     *
     * @param service
     * @param query
     */
    public async _search(
        service: CRUDExtension<Repository<EntityType>, EntityType>,
        query: SortablePagedSearch,
    ): Promise<EntityType[]> {
        const es: ServiceResponse<Partial<EsSearchOptionsStatic>> = ESSearchBodyBuilder(query);

        /**
         * Handle Query Builder errors
         */
        if (es.error) {
            switch (es.error) {
                case 'page_index_without_page_size': {
                    throw new HttpException(
                        {
                            status: StatusCodes.BadRequest,
                            message: es.error,
                        },
                        StatusCodes.BadRequest,
                    );
                }
            }
        }

        const searchResults = await service.searchElastic(es.response);

        /**
         * Handle Request errors
         */
        if (searchResults.error) {
            switch (searchResults.error) {
                default: {
                    throw new HttpException(
                        {
                            status: StatusCodes.InternalServerError,
                            message: searchResults.error,
                        },
                        StatusCodes.InternalServerError,
                    );
                }
            }
        }

        if (searchResults.response.hits.total !== 0) {
            return searchResults.response.hits.hits.map(fromES);
        }

        return [];
    }

    /**
     * Helper to authorizer on a global entity scale
     *
     * @param rightsService
     * @param service
     * @param user
     * @param entityValue
     * @param requiredRights
     * @private
     */
    public async _authorizeGlobal<AuthorizeEntity = EntityType>(
        rightsService: RightsService,
        service: CRUDExtension<Repository<AuthorizeEntity>, AuthorizeEntity>,
        user: UserDto,
        entityValue: string,
        requiredRights: string[],
    ): Promise<void> {
        const hasRights = await rightsService.hasGlobalRightsUpon<Repository<AuthorizeEntity>, AuthorizeEntity>(
            service,
            user,
            entityValue,
            requiredRights,
        );

        if (hasRights.error) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'unauthorized_action',
                },
                StatusCodes.Unauthorized,
            );
        }
    }

    /**
     * Helper to authorize on a specific set of entities
     *
     * @param rightsService
     * @param service
     * @param user
     * @param query
     * @param field
     * @param requiredRights
     * @private
     */
    public async _authorize<AuthorizeEntity = EntityType>(
        rightsService: RightsService,
        service: CRUDExtension<Repository<AuthorizeEntity>, AuthorizeEntity>,
        user: UserDto,
        query: SearchQuery<AuthorizeEntity>,
        field: string,
        requiredRights: string[],
    ): Promise<AuthorizeEntity[]> {
        const hasRights = await rightsService.hasRightsUpon<Repository<AuthorizeEntity>, AuthorizeEntity>(
            service,
            user,
            query,
            field,
            requiredRights,
        );

        if (hasRights.error) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'unauthorized_action',
                },
                StatusCodes.Unauthorized,
            );
        }

        return hasRights.response;
    }

    /**
     * Helper to authorize on a single entity
     *
     * @param rightsService
     * @param service
     * @param user
     * @param query
     * @param field
     * @param requiredRights
     * @private
     */
    public async _authorizeOne<AuthorizeEntity = EntityType>(
        rightsService: RightsService,
        service: CRUDExtension<Repository<AuthorizeEntity>, AuthorizeEntity>,
        user: UserDto,
        query: SearchQuery<AuthorizeEntity>,
        field: string,
        requiredRights: string[],
    ): Promise<AuthorizeEntity> {
        const hasRights = await rightsService.hasRightsUpon<Repository<AuthorizeEntity>, AuthorizeEntity>(
            service,
            user,
            query,
            field,
            requiredRights,
        );

        if (hasRights.error) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'unauthorized_action',
                },
                StatusCodes.Unauthorized,
            );
        }

        if (hasRights.response.length > 1) {
            throw new HttpException(
                {
                    status: StatusCodes.Conflict,
                    message: 'multiple_entities_found',
                },
                StatusCodes.Conflict,
            );
        }

        return hasRights.response[0];
    }

    /**
     * Elastic Search Helper
     *
     * @param service
     * @param query
     * @private
     */
    public async _elasticGet<CustomEntityType>(
        service: CRUDExtension<Repository<CustomEntityType>, CustomEntityType>,
        query: SortablePagedSearch,
    ): Promise<CustomEntityType[]> {
        const esQuery = ESSearchBodyBuilder(query);

        if (esQuery.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: esQuery.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        const entitiesQueryRes = await service.searchElastic(esQuery.response);

        if (entitiesQueryRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: entitiesQueryRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return entitiesQueryRes.response.hits.hits.map(
            (esh: ESSearchHit<CustomEntityType>): CustomEntityType => esh._source,
        );
    }

    /**
     * CQL Search Query Helper
     *
     * @param service
     * @param query
     * @param options
     * @private
     */
    public async _get<CustomEntityType>(
        service: CRUDExtension<Repository<CustomEntityType>, CustomEntityType>,
        query: SearchQuery<CustomEntityType>,
        options?: SearchOptions<CustomEntityType>,
    ): Promise<CustomEntityType[]> {
        const entitiesQueryRes = await service.search(query, options);

        if (entitiesQueryRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: entitiesQueryRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return entitiesQueryRes.response;
    }

    /**
     * CQL Search One Query Helper
     *
     * @param service
     * @param query
     * @param options
     * @private
     */
    public async _getOne<CustomEntityType>(
        service: CRUDExtension<Repository<CustomEntityType>, CustomEntityType>,
        query: SearchQuery<CustomEntityType>,
        options?: SearchOptions<CustomEntityType>,
    ): Promise<CustomEntityType> {
        const entitiesQueryRes = await service.search(query, options);

        if (entitiesQueryRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: entitiesQueryRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        if (entitiesQueryRes.response.length === 0) {
            throw new HttpException(
                {
                    status: StatusCodes.NotFound,
                    message: 'entity_not_found',
                },
                StatusCodes.NotFound,
            );
        }

        if (entitiesQueryRes.response.length > 1) {
            throw new HttpException(
                {
                    status: StatusCodes.Conflict,
                    message: 'multiple_entities_found',
                },
                StatusCodes.Conflict,
            );
        }

        return entitiesQueryRes.response[0];
    }

    /**
     * CQL Update Query Helper
     *
     * @param service
     * @param query
     * @param entity
     * @param options
     * @private
     */
    public async _edit<CustomEntityType>(
        service: CRUDExtension<Repository<CustomEntityType>, CustomEntityType>,
        query: SearchQuery<CustomEntityType>,
        entity: Partial<CustomEntityType>,
        options?: UpdateOptions<CustomEntityType>,
    ): Promise<void> {
        const updateQueryRes = await service.update(query, entity, options);

        if (updateQueryRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: updateQueryRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }
    }

    /**
     * CQL Insert Query Helper
     *
     * @param service
     * @param entity
     * @param options
     * @private
     */
    public async _new<CustomEntityType>(
        service: CRUDExtension<Repository<CustomEntityType>, CustomEntityType>,
        entity: Partial<CustomEntityType>,
        options?: SaveOptionsStatic,
    ): Promise<CustomEntityType> {
        const newEntityQueryRes = await service.create(entity, options);

        if (newEntityQueryRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: newEntityQueryRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return newEntityQueryRes.response;
    }
}
