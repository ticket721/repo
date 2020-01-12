import { ServiceResponse } from '@app/server/utils/ServiceResponse';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra';
import { ESSearchBodyBuilder } from '@lib/common/utils/ESSearchBodyBuilder';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { HttpException } from '@nestjs/common';
import { StatusCodes } from '@app/server/utils/codes';
import { fromES } from '@app/server/utils/fromES';
import { CRUDExtension } from '@lib/common/crud/CRUD.extension';

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
