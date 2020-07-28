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
import { ESCountReturn } from '@lib/common/utils/ESCountReturn.type';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';

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
     * Wrap crud response and throw hhtp error on any error with given code
     *
     * @param promise
     * @param errorStatus
     * @param message
     * @private
     */
    public async _crudCall<ResType = any>(
        promise: Promise<CRUDResponse<ResType>>,
        errorStatus: StatusCodes,
        message?: string,
    ): Promise<ResType> {
        const res = await promise;

        if (res.error) {
            throw new HttpException(
                {
                    status: errorStatus,
                    message: message || res.error,
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
     * @param errorMessage
     * @private
     */
    public async _serviceCall<ResType = any>(
        promise: Promise<ServiceResponse<ResType>>,
        errorStatus: StatusCodes,
        errorMessage?: string,
    ): Promise<ResType> {
        const res = await promise;

        if (res.error) {
            console.log('error', res.error);
            throw new HttpException(
                {
                    status: errorStatus,
                    message: errorMessage || res.error,
                },
                errorStatus,
            );
        }

        return res.response;
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
    public async _countRestricted<CustomEntityType = EntityType>(
        service: CRUDExtension<Repository<CustomEntityType>, CustomEntityType>,
        rightsService: RightsService,
        user: UserDto,
        field: string,
        query: SearchInputType<CustomEntityType>,
    ): Promise<ESCountReturn> {
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
                    message: restrictionsRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        const aggregatedFields = restrictionsRes.response.hits.hits.map(
            (esh: ESSearchHit<RightEntity>): any => esh._source.entity_value,
        );

        if (query[field] && query[field].$in) {
            for (const value of query[field].$in) {
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

        return this._count<CustomEntityType>(service, query);
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
    public async _searchRestricted<CustomEntityType = EntityType>(
        service: CRUDExtension<Repository<CustomEntityType>, CustomEntityType>,
        rightsService: RightsService,
        user: UserDto,
        field: string,
        query: SearchInputType<CustomEntityType>,
    ): Promise<CustomEntityType[]> {
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
                    message: restrictionsRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        const aggregatedFields = restrictionsRes.response.hits.hits.map(
            (esh: ESSearchHit<RightEntity>): any => esh._source.entity_value,
        );

        if (query[field] && query[field].$in) {
            for (const value of query[field].$in) {
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

        return this._search<CustomEntityType>(service, query);
    }

    /**
     * Builds an ESQuery body
     *
     * @param query
     * @param disableAutoSize
     * @private
     */
    public _esQueryBuilder<CustomEntity = EntityType>(
        query: SortablePagedSearch,
        disableAutoSize?: boolean,
    ): EsSearchOptionsStatic {
        let esQuery;
        try {
            if (query.$page_size === undefined && query.$page_index === undefined && !disableAutoSize) {
                query.$page_size = 10000;
                query.$page_index = 0;
            }

            esQuery = ESSearchBodyBuilder(query);
        } catch (e) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'body_creation_error',
                },
                StatusCodes.InternalServerError,
            );
        }

        if (esQuery.error) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: esQuery.error,
                },
                StatusCodes.BadRequest,
            );
        }

        return esQuery.response;
    }

    /**
     * Generic count query, able to throw HttpExceptions
     *
     * @param service
     * @param query
     */
    public async _count<CustomEntityType = EntityType>(
        service: CRUDExtension<Repository<CustomEntityType>, CustomEntityType>,
        query: SearchInputType<CustomEntityType>,
    ): Promise<ESCountReturn> {
        const es: EsSearchOptionsStatic = this._esQueryBuilder(query, true);

        const countResults = await service.countElastic(es);

        /**
         * Handle Request errors
         */
        if (countResults.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: countResults.error,
                },
                StatusCodes.InternalServerError,
            );
        }
        return countResults.response;
    }

    /**
     * Generic search query, able to throw HttpExceptions
     *
     * @param service
     * @param query
     */
    public async _search<CustomEntityType = EntityType>(
        service: CRUDExtension<Repository<CustomEntityType>, CustomEntityType>,
        query: SearchInputType<CustomEntityType>,
    ): Promise<CustomEntityType[]> {
        const es: EsSearchOptionsStatic = this._esQueryBuilder(query);

        const searchResults = await service.searchElastic(es);

        /**
         * Handle Request errors
         */
        if (searchResults.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: searchResults.error,
                },
                StatusCodes.InternalServerError,
            );
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
