import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { BaseModel, EsSearchOptionsStatic, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { MetadatasRepository } from '@lib/common/metadatas/Metadatas.repository';
import { MetadataEntity } from '@lib/common/metadatas/entities/Metadata.entity';
import { Link } from '@lib/common/utils/Link.type';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { RightsService } from '@lib/common/rights/Rights.service';
import { ESSearchBodyBuilder } from '@lib/common/utils/ESSearchBodyBuilder.helper';
import { ESSearchHit } from '@lib/common/utils/ESSearchReturn.type';
import { fromES } from '@lib/common/utils/fromES.helper';

/**
 * Class Validator enabled input for the metadata data field
 */
export class MetadataInput {
    /**
     * Generic Bool field
     */
    bool?: { [key: string]: boolean };

    /**
     * Generic String field
     */
    str?: { [key: string]: string };

    /**
     * Generic Integer field
     */
    int?: { [key: string]: number };

    /**
     * Generic Date field
     */
    date?: { [key: string]: Date };

    /**
     * Generic Double field
     */
    double?: { [key: string]: number };
}

/**
 * Input Links, with ability to delegate rights on an entities other field
 */
export class InputLink extends Link {
    /**
     * Id value to use for right checks
     */
    rightId?: string;

    /**
     * ID field to use for right checks
     */
    rightField?: string;
}

/**
 * Action modes upon metadata entities
 */
export enum MetaRightMode {
    MetaRead,
    MetaWrite,
}

/**
 * Action modes names
 */
export const MetaRightModeNames = {
    [MetaRightMode.MetaRead]: 'read',
    [MetaRightMode.MetaWrite]: 'write',
};

/**
 * Service to CRUD MetadataEntities
 */
export class MetadatasService extends CRUDExtension<MetadatasRepository, MetadataEntity> {
    /**
     * Dependency Injection
     *
     * @param metadatasRepository
     * @param metadataEntity
     */

    /* istanbul ignore next */
    constructor(
        @InjectRepository(MetadatasRepository)
        metadatasRepository: MetadatasRepository,
        @InjectModel(MetadataEntity)
        metadataEntity: BaseModel<MetadataEntity>,
        private readonly rightsService: RightsService,
    ) {
        super(
            metadataEntity,
            metadatasRepository,
            /* istanbul ignore next */
            (e: MetadataEntity) => {
                return new metadataEntity(e);
            },
            /* istanbul ignore next */
            (i: MetadataEntity) => {
                return new MetadataEntity(i);
            },
        );
    }

    /**
     * Return a list with possible rights to perform specific action upon entities
     *
     * @param className
     * @param mode
     */
    private getRequiredRights(className: string, mode: MetaRightMode): string[] {
        return [
            `metadata_all`,
            `metadata_${MetaRightModeNames[mode]}_all`,
            `metadata_${MetaRightModeNames[mode]}_${className}`,
        ];
    }

    /**
     * Utility method to check if user has read/write rights upong specific entity with specific metadata class name
     *
     * @param entityName
     * @param entityValue
     * @param user
     * @param mode
     * @param className
     */
    async hasMetaRight(
        entityName: string,
        entityValue: string,
        user: UserDto,
        mode: MetaRightMode,
        className: string,
    ): Promise<ServiceResponse<boolean>> {
        const rightsReq = await this.rightsService.search({
            grantee_id: user.id,
            entity_type: entityName,
            entity_value: entityValue,
        });

        if (rightsReq.error) {
            return {
                error: rightsReq.error,
                response: null,
            };
        }

        if (rightsReq.response.length === 0) {
            return {
                error: 'rights_not_found',
                response: null,
            };
        }

        const rights = rightsReq.response[0];

        const rightsConfigRes = await this.rightsService.getRightsConfig(entityName);

        if (rightsConfigRes.error) {
            return {
                error: rightsConfigRes.error,
                response: null,
            };
        }

        const rightsList = await this.rightsService.getAllRights(rightsConfigRes.response, rights);

        const requiredRightsList = this.getRequiredRights(className, mode);

        const commonRights = rightsList.filter((right: string): boolean => {
            return requiredRightsList.indexOf(right) !== -1;
        });

        return {
            error: null,
            response: commonRights.length > 0,
        };
    }

    /**
     * Utility to check if rights required by user are valid
     *
     * @param links
     * @param linkType
     * @param user
     * @param service
     * @param className
     * @param mode
     */
    private async checkInputLinkRights(
        links: InputLink[],
        linkType: string,
        user: UserDto,
        service: CRUDExtension<any, any>,
        className: string,
        mode: MetaRightMode,
    ): Promise<ServiceResponse<void>> {
        for (const link of links) {
            switch (link.type) {
                case 'user': {
                    if (user[link.field] !== link.id) {
                        return {
                            error: `unauthorized_user_${linkType}_link`,
                            response: null,
                        };
                    }

                    break;
                }
                default: {
                    let rightsCheckRes: ServiceResponse<boolean>;

                    if (link.rightField && link.rightId) {
                        const esSearchQuery = ESSearchBodyBuilder({
                            [link.field]: {
                                $eq: link.id,
                            },
                        });

                        /* istanbul ignore next */
                        if (esSearchQuery.error) {
                            return {
                                error: `entity_query_building_error`,
                                response: null,
                            };
                        }

                        const entities = await service.searchElastic(esSearchQuery.response);

                        if (entities.error) {
                            return {
                                error: `entity_query_error`,
                                response: null,
                            };
                        }

                        if (entities.response.hits.total > 0) {
                            for (const eshit of entities.response.hits.hits) {
                                if (eshit._source[link.rightField] !== link.rightId) {
                                    return {
                                        error: `unauthorized_link`,
                                        response: null,
                                    };
                                }
                            }
                        } else {
                            return {
                                error: `entities_not_found`,
                                response: null,
                            };
                        }

                        rightsCheckRes = await this.hasMetaRight(link.type, link.rightId, user, mode, className);
                    } else {
                        rightsCheckRes = await this.hasMetaRight(link.type, link.id, user, mode, className);
                    }

                    if (rightsCheckRes.error || rightsCheckRes.response === false) {
                        return {
                            error: `unauthorized_entity_${linkType}_link`,
                            response: null,
                        };
                    }

                    break;
                }
            }
        }

        return {
            error: null,
            response: null,
        };
    }

    /**
     * Performs link checks on links, readers and writers
     *
     * @param links
     * @param readers
     * @param writers
     * @param user
     * @param service
     * @param className
     */
    private async performAllInputLinksChecks(
        links: InputLink[],
        readers: InputLink[],
        writers: InputLink[],
        user: UserDto,
        service: CRUDExtension<any, any>,
        className: string,
    ): Promise<ServiceResponse<void>> {
        const linkCheckRes = await this.checkInputLinkRights(
            links,
            'link',
            user,
            service,
            className,
            MetaRightMode.MetaWrite,
        );

        if (linkCheckRes.error) {
            return {
                error: linkCheckRes.error,
                response: null,
            };
        }

        const readerCheckRes = await this.checkInputLinkRights(
            readers,
            'reader',
            user,
            service,
            className,
            MetaRightMode.MetaWrite,
        );

        if (readerCheckRes.error) {
            return {
                error: readerCheckRes.error,
                response: null,
            };
        }

        const writerCheckRes = await this.checkInputLinkRights(
            writers,
            'writer',
            user,
            service,
            className,
            MetaRightMode.MetaWrite,
        );

        if (writerCheckRes.error) {
            return {
                error: writerCheckRes.error,
                response: null,
            };
        }

        return {
            error: null,
            response: null,
        };
    }

    /**
     * Attaches a new metadata entity
     *
     * @param className
     * @param typeName
     * @param links
     * @param readers
     * @param writers
     * @param data
     * @param user
     * @param service
     */
    async attach(
        className: string,
        typeName: string,
        links: InputLink[],
        readers: InputLink[],
        writers: InputLink[],
        data: MetadataInput,
        user: UserDto,
        service: CRUDExtension<any, any>,
    ): Promise<ServiceResponse<MetadataEntity>> {
        const linkChecksRes = await this.performAllInputLinksChecks(links, readers, writers, user, service, className);

        if (linkChecksRes.error) {
            return {
                error: linkChecksRes.error,
                response: null,
            };
        }

        const metadataEntityRes = await this.create({
            links,
            readers,
            public_read: readers.length === 0,
            writers,
            public_write: false,
            class_name: className,
            type_name: typeName,
            bool_: data.bool,
            str_: data.str,
            int_: data.int,
            date_: data.date,
            double_: data.double,
        });

        if (metadataEntityRes.error) {
            return {
                error: 'metadata_creation_error',
                response: null,
            };
        }

        return {
            error: null,
            response: metadataEntityRes.response,
        };
    }

    /**
     * Inject the link restriction segment of the esquery
     *
     * @param links
     * @param query
     */
    private injectLinkRestrictions(links: Link[], query: EsSearchOptionsStatic): EsSearchOptionsStatic {
        for (const link of links) {
            query.body.query.bool.must.push({
                nested: {
                    path: 'links',
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        'links.type': link.type,
                                    },
                                },
                                {
                                    term: {
                                        'links.id': link.id,
                                    },
                                },
                                {
                                    term: {
                                        'links.field': link.field,
                                    },
                                },
                            ],
                        },
                    },
                },
            });
        }

        return query;
    }

    /**
     * Inject the reader restriction segment of the esquery
     *
     * @param readers
     * @param query
     */
    private injectReaderRestrictions(readers: Link[], query: EsSearchOptionsStatic): EsSearchOptionsStatic {
        const subquery = {
            bool: {
                should: [],
            },
        };

        for (const reader of readers) {
            subquery.bool.should.push({
                nested: {
                    path: 'readers',
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        'readers.type': reader.type,
                                    },
                                },
                                {
                                    term: {
                                        'readers.id': reader.id,
                                    },
                                },
                                {
                                    term: {
                                        'readers.field': reader.field,
                                    },
                                },
                            ],
                        },
                    },
                },
            });
        }

        subquery.bool.should.push({
            term: {
                public_read: true,
            },
        });

        query.body.query.bool.must.push(subquery);

        return query;
    }

    /**
     * Inject the class name and type name restriction segment of the esquery
     *
     * @param className
     * @param typeName
     * @param query
     */
    private injectClassAndType(
        className: string,
        typeName: string,
        query: EsSearchOptionsStatic,
    ): EsSearchOptionsStatic {
        query.body.query.bool.must.push({
            term: {
                class_name: className,
            },
        });

        if (typeName) {
            query.body.query.bool.must.push({
                term: {
                    type_name: typeName,
                },
            });
        }

        return query;
    }

    /**
     * Performs an es query to recover all metadata entities with given links, and tries to unlock rights for user if any readRights provided
     *
     * @param user
     * @param links
     * @param readRights
     * @param className
     * @param typeName
     */
    async fetch(
        user: UserDto,
        links: Link[],
        readRights: Link[],
        className: string,
        typeName?: string,
    ): Promise<ServiceResponse<MetadataEntity[]>> {
        const linkChecksRes = await this.checkInputLinkRights(
            readRights,
            'readers',
            user,
            null,
            className,
            MetaRightMode.MetaRead,
        );

        if (linkChecksRes.error) {
            return {
                error: 'unauthorized_read_rights',
                response: null,
            };
        }

        const query = {
            body: {
                query: {
                    bool: {
                        must: [],
                    },
                },
            },
        };

        const filledQuery = this.injectClassAndType(
            className,
            typeName,
            this.injectReaderRestrictions(readRights, this.injectLinkRestrictions(links, query)),
        );

        const metadataRes = await this.searchElastic(filledQuery);

        return {
            error: metadataRes.error,
            response: metadataRes.response
                ? metadataRes.response.hits.hits.map(
                      (esh: ESSearchHit<MetadataEntity>): MetadataEntity => fromES<MetadataEntity>(esh),
                  )
                : null,
        };
    }
}
