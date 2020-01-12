import {
    BaseModel,
    DeleteOptionsStatic,
    EsSearchOptionsStatic,
    FindQuery,
    FindQueryOptionsStatic,
    Repository,
    SaveOptionsStatic,
    UpdateOptionsStatic,
    uuid,
} from '@iaminfinity/express-cassandra';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn';

/**
 * Response format of all methods
 */
export interface CRUDResponse<EntityType> {
    /**
     * Resulting entity response
     */
    response: EntityType;

    /**
     * Generated error response. Null if none
     */
    error?: string;
}

/**
 * Search Options to match entities with cassandra queries
 */
export type SearchQuery<EntityType> = FindQuery<EntityType>;

/**
 * Search Options to match entities with elasticsearch queries
 */
export type ESSearchQuery<EntityType> = EsSearchOptionsStatic;

/**
 * Extra Options when creation an entity
 */
export type CreateOptions = SaveOptionsStatic;

/**
 * Extra Options when search for entities
 */
export type SearchOptions = FindQueryOptionsStatic;

/**
 * Extra Options when updating an entity
 */
export type UpdateOptions<EntityType> = UpdateOptionsStatic<EntityType>;

/**
 * Extra Options when deleting an entity
 */
export type DeleteOptions = DeleteOptionsStatic;

/**
 * CRUD Extension for services. Adds primitive functions to properly implement
 * CRUD functionalities.
 */
export class CRUDExtension<RepositoryType extends Repository, EntityType> {
    // /**
    //  * Name of the entity
    //  */
    // private readonly _name: string;

    // /**
    //  * Current keyspace of the entity
    //  */
    // private readonly _keyspace: string;

    // /**
    //  * Primary key field names of the entity
    //  */
    // private readonly _keys: string[];

    /**
     * Fields of the entity
     */
    private readonly _fields: { [key: string]: any };

    /**
     * Dependency Injection
     *
     * @param _model
     * @param _repository
     */
    constructor(
        private readonly _model: BaseModel<EntityType>,
        private readonly _repository: RepositoryType,
    ) {
        const properties = (this._model as any)._properties;

        // this._name = properties.schema.table_name;
        // this._keyspace = properties.keyspace;
        // this._keys = properties.schema.key;
        this._fields = properties.schema.fields;
    }

    /**
     * Utility to adapt any uuid argument from the provided entity
     *
     * @param entity
     */
    private adaptUUIDFieldTypesFilter(
        entity: Partial<EntityType>,
    ): Partial<EntityType> {
        const returnedValue: Partial<EntityType> = {};

        for (const field of Object.keys(entity)) {
            if (this._fields[field].type === 'uuid') {
                returnedValue[field] = uuid(entity[field]) as any;
            } else {
                returnedValue[field] = entity[field];
            }
        }

        return returnedValue;
    }

    /**
     * Utility to adapt entity fields to cassandra types
     *
     * @param entity
     */
    private adaptFieldTypesFilter(
        entity: Partial<EntityType>,
    ): Partial<EntityType> {
        return this.adaptUUIDFieldTypesFilter(entity);
    }

    /**
     * Regular Expression to be 100% we're working with an annoying uuid object
     */
    private readonly uuidRegExp = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;

    /**
     * Utility to check if field is Uuid
     */
    private isUuid(val: any) {
        return (
            typeof val === 'object' &&
            typeof val.buffer === 'object' &&
            typeof val.getBuffer === 'function' &&
            typeof val.equals === 'function' &&
            typeof val.toString === 'function' &&
            typeof val.inspect === 'function' &&
            this.uuidRegExp.test(val.toString())
        );
    }

    /**
     * Utility to recursively track and adapt uuids objects to string
     *
     * @param entity
     */
    private adaptResponseTypeFilter(entity: any): any {
        switch (typeof entity) {
            case 'object': {
                if (Array.isArray(entity)) {
                    return entity.map((elem: any) =>
                        this.adaptResponseTypeFilter(elem),
                    );
                } else {
                    if (this.isUuid(entity)) {
                        return entity.toString();
                    } else {
                        for (const key of Object.keys(entity)) {
                            entity[key] = this.adaptResponseTypeFilter(
                                entity[key],
                            );
                        }
                        return entity;
                    }
                }
            }

            default: {
                return entity;
            }
        }
    }

    /**
     * Utility to adapt any uuid argument from the provided search query
     *
     * @param query
     */
    private adaptQueryUUIDFieldTypesFilter(
        query: SearchQuery<EntityType>,
    ): Partial<EntityType> {
        const returnedValue: Partial<EntityType> = {};

        for (const field of Object.keys(query)) {
            if (this._fields[field].type === 'uuid') {
                switch (typeof query[field]) {
                    case 'string':
                        returnedValue[field] = uuid(query[field]) as any;
                        break;
                    case 'object':
                        returnedValue[field] = {};
                        for (const key of Object.keys(query[field])) {
                            if (typeof query[field][key] === 'string') {
                                returnedValue[field][key] = uuid(
                                    query[field][key],
                                );
                            } else if (key === '$contains_key') {
                                returnedValue[field][key] = [];
                                for (const subkey of query[field][key]) {
                                    returnedValue[field][key].push(
                                        uuid(subkey),
                                    );
                                }
                            } else {
                                returnedValue[field][key] = query[field][key];
                            }
                        }
                        break;
                    default:
                        returnedValue[field] = query[field];
                }
            } else {
                returnedValue[field] = query[field];
            }
        }

        return returnedValue;
    }

    /**
     * Utility to adapt a search query parameter to cassandra types
     *
     * @param query
     */
    private adaptQueryFieldTypesFilter(
        query: SearchQuery<EntityType>,
    ): Partial<EntityType> {
        return this.adaptQueryUUIDFieldTypesFilter(query);
    }

    //  ██████╗ █████╗ ███████╗███████╗ █████╗ ███╗   ██╗██████╗ ██████╗  █████╗
    // ██╔════╝██╔══██╗██╔════╝██╔════╝██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔══██╗
    // ██║     ███████║███████╗███████╗███████║██╔██╗ ██║██║  ██║██████╔╝███████║
    // ██║     ██╔══██║╚════██║╚════██║██╔══██║██║╚██╗██║██║  ██║██╔══██╗██╔══██║
    // ╚██████╗██║  ██║███████║███████║██║  ██║██║ ╚████║██████╔╝██║  ██║██║  ██║
    // ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝

    /**
     * Uses the Cassandra Driver to run an insert query
     *
     * @param entity
     * @param options
     */
    async create(
        entity: Partial<EntityType>,
        options?: CreateOptions,
    ): Promise<CRUDResponse<EntityType>> {
        try {
            const processedEntity: Partial<EntityType> = this.adaptFieldTypesFilter(
                entity,
            );

            const createdEntity: EntityType = await this._repository
                .save(this._repository.create(processedEntity), options)
                .toPromise();

            return {
                response: createdEntity,
                error: null,
            };
        } catch (e) {
            return {
                response: null,
                error: e.message,
            };
        }
    }

    /**
     * Uses the Cassandra Driver to run an search query
     *
     * @param find
     * @param options
     */
    async search(
        find: SearchQuery<EntityType>,
        options?: SearchOptions,
    ): Promise<CRUDResponse<EntityType[]>> {
        try {
            const processedQuery: SearchQuery<EntityType> = this.adaptQueryFieldTypesFilter(
                find,
            );

            const results: EntityType[] = await this._repository
                .find(processedQuery, options)
                .toPromise();

            return {
                response: results,
                error: null,
            };
        } catch (e) {
            return {
                response: null,
                error: e.message,
            };
        }
    }

    /**
     * Uses the Cassandra Driver to run an update query on fields matched by
     * the `find` argument
     *
     * @param find
     * @param entity
     * @param options
     */
    async update(
        find: SearchQuery<EntityType>,
        entity: Partial<EntityType>,
        options?: UpdateOptions<EntityType>,
    ): Promise<CRUDResponse<EntityType>> {
        try {
            const processedEntity: Partial<EntityType> = this.adaptFieldTypesFilter(
                entity,
            );
            const processedQuery: SearchQuery<EntityType> = this.adaptQueryFieldTypesFilter(
                find,
            );

            const res = await this._repository
                .update(processedQuery, processedEntity, options)
                .toPromise();

            return {
                response: res,
                error: null,
            };
        } catch (e) {
            return {
                response: null,
                error: e.message,
            };
        }
    }

    /**
     * Uses Cassandra Driver to delete provided entity from the database
     *
     * @param find
     * @param options
     */
    async delete(
        find: SearchQuery<EntityType>,
        options?: DeleteOptions,
    ): Promise<CRUDResponse<void>> {
        try {
            const processedQuery: SearchQuery<EntityType> = this.adaptQueryFieldTypesFilter(
                find,
            );

            const res = await this._repository
                .delete(processedQuery, options)
                .toPromise();

            return {
                response: res,
                error: null,
            };
        } catch (e) {
            return {
                response: null,
                error: e.message,
            };
        }
    }

    // ███████╗██╗      █████╗ ███████╗████████╗██╗ ██████╗
    // ██╔════╝██║     ██╔══██╗██╔════╝╚══██╔══╝██║██╔════╝
    // █████╗  ██║     ███████║███████╗   ██║   ██║██║
    // ██╔══╝  ██║     ██╔══██║╚════██║   ██║   ██║██║
    // ███████╗███████╗██║  ██║███████║   ██║   ██║╚██████╗
    // ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝ ╚═════╝
    // ███████╗███████╗ █████╗ ██████╗  ██████╗██╗  ██╗
    // ██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝██║  ██║
    // ███████╗█████╗  ███████║██████╔╝██║     ███████║
    // ╚════██║██╔══╝  ██╔══██║██╔══██╗██║     ██╔══██║
    // ███████║███████╗██║  ██║██║  ██║╚██████╗██║  ██║
    // ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝

    /**
     * Uses the ElasticSearch Driver to performant an efficient secondary index
     * search
     *
     * @param options
     */
    async searchElastic(
        options: ESSearchQuery<EntityType>,
    ): Promise<CRUDResponse<ESSearchReturn<EntityType>>> {
        try {
            const queryResult: ESSearchReturn<EntityType> = await new Promise(
                (ok, ko): void => {
                    this._model.search(options, (err, result): void => {
                        if (err) {
                            return ko(err);
                        }
                        ok(result);
                    });
                },
            );

            return {
                response: this.adaptResponseTypeFilter(queryResult),
                error: null,
            };
        } catch (e) {
            return {
                response: null,
                error: e.message,
            };
        }
    }
}
