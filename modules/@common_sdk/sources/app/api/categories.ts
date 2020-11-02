import { AxiosResponse }                       from 'axios';
import { T721SDK }                             from '../../index';
import { CategoriesSearchResponseDto }         from '@app/server/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoriesSearchInputDto }            from '@app/server/controllers/categories/dto/CategoriesSearchInput.dto';
import { CategoriesCountInputDto }             from '@app/server/controllers/categories/dto/CategoriesCountInput.dto';
import { CategoriesCountResponseDto }          from '@app/server/controllers/categories/dto/CategoriesCountResponse.dto';
import { CategoriesAddDateLinksInputDto }       from '@app/server/controllers/categories/dto/CategoriesAddDateLinksInput.dto';
import { CategoriesAddDateLinksResponseDto }    from '@app/server/controllers/categories/dto/CategoriesAddDateLinksResponse.dto';
import { CategoriesEditInputDto }              from '@app/server/controllers/categories/dto/CategoriesEditInput.dto';
import { CategoriesEditResponseDto }           from '@app/server/controllers/categories/dto/CategoriesEditResponse.dto';
import { CategoriesRemoveDateLinksInputDto } from '@app/server/controllers/categories/dto/CategoriesRemoveDateLinksInput.dto';
import { CategoriesRemoveDateLinksResponseDto } from '@app/server/controllers/categories/dto/CategoriesRemoveDateLinksResponse.dto';
import { CategoriesOwnerResponseDto }          from '@app/server/controllers/categories/dto/CategoriesOwnerResponse.dto';
import { CategoriesCountTicketResponseDto }    from '@app/server/controllers/categories/dto/CategoriesCountTicketResponse.dto';

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

export async function categoriesOwner(
    token: string,
    category: string
): Promise<AxiosResponse<CategoriesOwnerResponseDto>> {

    const self: T721SDK = this;

    return self.get(`/categories/owner/${category}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    });
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

export async function categoriesTicketCount(
    token: string,
    category: string
): Promise<AxiosResponse<CategoriesCountTicketResponseDto>> {

    const self: T721SDK = this;

    return self.get(`/categories/${category}/ticket-count`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    });
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

export async function categoriesRemoveDateLinks(
    token: string,
    category: string,
    query: Partial<CategoriesRemoveDateLinksInputDto>,
): Promise<AxiosResponse<CategoriesRemoveDateLinksResponseDto>> {

    const self: T721SDK = this;

    return self.delete<Partial<CategoriesRemoveDateLinksInputDto>>(`/categories/${category}/date`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function categoriesAddDateLinks(
    token: string,
    category: string,
    query: Partial<CategoriesAddDateLinksInputDto>,
): Promise<AxiosResponse<CategoriesAddDateLinksResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<CategoriesAddDateLinksInputDto>>(`/categories/${category}/date`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}
