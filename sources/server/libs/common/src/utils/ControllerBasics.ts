import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra';
import { ESSearchBodyBuilder } from '@lib/common/utils/ESSearchBodyBuilder';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { HttpException } from '@nestjs/common';
import { CRUDExtension } from '@lib/common/crud/CRUD.extension';
import { keccak256 } from '@ticket721sources/global';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse';
import { StatusCodes } from '@lib/common/utils/codes';
import { fromES } from '@lib/common/utils/fromES';

/**
 * Generic search query, able to throw HttpExceptions
 *
 * @param service
 * @param query
 */
export async function search<
    DataType,
    ServiceType extends CRUDExtension<any, any>
>(service: ServiceType, query: SortablePagedSearch): Promise<DataType[]> {
    const es: ServiceResponse<Partial<
        EsSearchOptionsStatic
    >> = ESSearchBodyBuilder(query);

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
 * Generic hash query, able to throw HttpExceptions
 *
 * @param service
 * @param query
 * @param hashed
 */
export async function hash<
    DataType,
    ServiceType extends CRUDExtension<any, any>
>(
    service: ServiceType,
    query: SortablePagedSearch,
    hashed: string[],
): Promise<[number, string]> {
    const sortedFieldNames = hashed.sort();

    const res = await search<DataType, ServiceType>(service, query);

    let data = '';

    for (const field of sortedFieldNames) {
        for (const entity of res) {
            data = `${data}:${entity[field]}`;
        }
    }

    return [res.length, keccak256(data)];
}
