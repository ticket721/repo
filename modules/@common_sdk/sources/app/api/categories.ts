import { AxiosResponse }                    from 'axios';
import { T721SDK }                          from '../../index';
import { CategoriesSearchResponseDto }      from '@app/server/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoriesSearchInputDto }         from '@app/server/controllers/categories/dto/CategoriesSearchInput.dto';
import { CategoriesCountInputDto }          from '@app/server/controllers/categories/dto/CategoriesCountInput.dto';
import { CategoriesCountResponseDto }       from '@app/server/controllers/categories/dto/CategoriesCountResponse.dto';
import { CategoriesAddDateLinkInputDto }    from '@app/server/controllers/categories/dto/CategoriesAddDateLinkInput.dto';
import { CategoriesAddDateLinkResponseDto } from '@app/server/controllers/categories/dto/CategoriesAddDateLinkResponse.dto';

export async function categoriesSearch(
    token: string,
    query: Partial<CategoriesSearchInputDto>,
): Promise<AxiosResponse<CategoriesSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<CategoriesSearchInputDto>>('/categories/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function categoriesCount(
    token: string,
    query: Partial<CategoriesCountInputDto>,
): Promise<AxiosResponse<CategoriesCountResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<CategoriesCountInputDto>>('/categories/count', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function categoriesAddDateLink(
    token: string,
    category: string,
    query: Partial<CategoriesAddDateLinkInputDto>,
): Promise<AxiosResponse<CategoriesAddDateLinkResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<CategoriesAddDateLinkInputDto>>(`/categories/${category}/date`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}
