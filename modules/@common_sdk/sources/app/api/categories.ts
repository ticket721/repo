import { AxiosResponse }               from 'axios';
import { T721SDK }                     from '../../index';
import { CategoriesCreateInputDto }    from '@app/server/controllers/categories/dto/CategoriesCreateInput.dto';
import { CategoriesCreateResponseDto } from '@app/server/controllers/categories/dto/CategoriesCreateResponse.dto';
import { CategoriesSearchResponseDto } from '@app/server/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoriesSearchInputDto }    from '@app/server/controllers/categories/dto/CategoriesSearchInput.dto';
import { CategoriesUpdateInputDto }    from '@app/server/controllers/categories/dto/CategoriesUpdateInput.dto';
import { CategoriesUpdateResponseDto } from '@app/server/controllers/categories/dto/CategoriesUpdateResponse.dto';
import { CategoriesCountInputDto }     from '@app/server/controllers/categories/dto/CategoriesCountInput.dto';
import { CategoriesCountResponseDto }  from '@app/server/controllers/categories/dto/CategoriesCountResponse.dto';

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
    query: CategoriesCountInputDto,
): Promise<AxiosResponse<CategoriesCountResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<CategoriesCountInputDto>>('/categories/count', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function categoriesCreate(
    token: string,
    query: CategoriesCreateInputDto
): Promise<AxiosResponse<CategoriesCreateResponseDto>> {
    const self: T721SDK = this;

    return self.post<CategoriesCreateInputDto>('/categories', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function categoriesUpdate(
    token: string,
    category: string,
    query: CategoriesUpdateInputDto
): Promise<AxiosResponse<CategoriesUpdateResponseDto>> {
    const self: T721SDK = this;

    return self.put<CategoriesUpdateInputDto>(`/categories/${category}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}
