import { AxiosResponse }                       from 'axios';
import { T721SDK }                             from '../../index';
import { CategoriesSearchResponseDto }         from '@app/server/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoriesSearchInputDto }            from '@app/server/controllers/categories/dto/CategoriesSearchInput.dto';
import { CategoriesCountInputDto }             from '@app/server/controllers/categories/dto/CategoriesCountInput.dto';
import { CategoriesCountResponseDto }          from '@app/server/controllers/categories/dto/CategoriesCountResponse.dto';
import { CategoriesAddDateLinkInputDto }       from '@app/server/controllers/categories/dto/CategoriesAddDateLinkInput.dto';
import { CategoriesAddDateLinkResponseDto }    from '@app/server/controllers/categories/dto/CategoriesAddDateLinkResponse.dto';
import { CategoriesEditInputDto }              from '@app/server/controllers/categories/dto/CategoriesEditInput.dto';
import { CategoriesEditResponseDto }           from '@app/server/controllers/categories/dto/CategoriesEditResponse.dto';
import { CategoriesRemoveDateLinkResponseDto } from '@app/server/controllers/categories/dto/CategoriesRemoveDateLinkResponse.dto';

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

export async function categoriesEdit(
    token: string,
    category: string,
    query: Partial<CategoriesEditInputDto>,
): Promise<AxiosResponse<CategoriesEditResponseDto>> {

    const self: T721SDK = this;

    return self.put<Partial<CategoriesEditInputDto>>(`/categories/${category}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function categoriesDelete(
    token: string,
    category: string
): Promise<AxiosResponse<CategoriesEditResponseDto>> {

    const self: T721SDK = this;

    return self.delete(`/categories/${category}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, null);
}

export async function categoriesRemoveDateLink(
    token: string,
    category: string,
    date: string
): Promise<AxiosResponse<CategoriesRemoveDateLinkResponseDto>> {

    const self: T721SDK = this;

    return self.delete(`/categories/${category}/date/${date}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, null);
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
