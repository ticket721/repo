import { AxiosResponse }                    from 'axios';
import { T721SDK }                          from '../../index';
import { DatesSearchInputDto }              from '@app/server/controllers/dates/dto/DatesSearchInput.dto';
import { DatesSearchResponseDto }           from '@app/server/controllers/dates/dto/DatesSearchResponse.dto';
import { DatesCreateInputDto }              from '@app/server/controllers/dates/dto/DatesCreateInput.dto';
import { DatesCreateResponseDto }           from '@app/server/controllers/dates/dto/DatesCreateResponse.dto';
import { DatesAddCategoriesInputDto }       from '@app/server/controllers/dates/dto/DatesAddCategoriesInput.dto';
import { DatesAddCategoriesResponseDto }    from '@app/server/controllers/dates/dto/DatesAddCategoriesResponse.dto';
import { DatesDeleteCategoriesInputDto }    from '@app/server/controllers/dates/dto/DatesDeleteCategoriesInput.dto';
import { DatesDeleteCategoriesResponseDto } from '@app/server/controllers/dates/dto/DatesDeleteCategoriesResponse.dto';
import { DatesUpdateInputDto }              from '@app/server/controllers/dates/dto/DatesUpdateInput.dto';
import { DatesUpdateResponseDto }           from '@app/server/controllers/dates/dto/DatesUpdateResponse.dto';
import { DatesCountInputDto }               from '@app/server/controllers/dates/dto/DatesCountInput.dto';
import { DatesCountResponseDto }            from '@app/server/controllers/dates/dto/DatesCountResponse.dto';
import { DatesHomeSearchInputDto }          from '@app/server/controllers/dates/dto/DatesHomeSearchInput.dto';
import { DatesHomeSearchResponseDto }       from '@app/server/controllers/dates/dto/DatesHomeSearchResponse.dto';
import { DatesFuzzySearchInputDto }         from '@app/server/controllers/dates/dto/DatesFuzzySearchInput.dto';
import { DatesFuzzySearchResponseDto }      from '@app/server/controllers/dates/dto/DatesFuzzySearchResponse.dto';

export async function datesSearch(
    token: string,
    query: Partial<DatesSearchInputDto>,
): Promise<AxiosResponse<DatesSearchResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<DatesSearchInputDto>>('/dates/search', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function datesCount(
    token: string,
    query: Partial<DatesCountInputDto>,
    ): Promise<AxiosResponse<DatesCountResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<DatesCountInputDto>>('/dates/count', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function datesCreate(
    token: string,
    query: DatesCreateInputDto
): Promise<AxiosResponse<DatesCreateResponseDto>> {
    const self: T721SDK = this;

    return self.post<DatesCreateInputDto>('/dates', {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function datesAddCategories(
    token: string,
    dateId: string,
    query: DatesAddCategoriesInputDto
): Promise<AxiosResponse<DatesAddCategoriesResponseDto>> {
    const self: T721SDK = this;

    return self.post<DatesAddCategoriesInputDto>(`/dates/${dateId}/categories`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function datesDeleteCategories(
    token: string,
    dateId: string,
    query: DatesDeleteCategoriesInputDto
): Promise<AxiosResponse<DatesDeleteCategoriesResponseDto>> {
    const self: T721SDK = this;

    return self.delete<DatesAddCategoriesInputDto>(`/dates/${dateId}/categories`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function datesUpdate(
    token: string,
    dateId: string,
    query: DatesUpdateInputDto
): Promise<AxiosResponse<DatesUpdateResponseDto>> {
    const self: T721SDK = this;

    return self.put<DatesUpdateInputDto>(`/dates/${dateId}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function datesHomeSearch(
    token: string,
    query: DatesHomeSearchInputDto
): Promise<AxiosResponse<DatesHomeSearchResponseDto>> {
    const self: T721SDK = this;

    return self.post<DatesHomeSearchInputDto>(`/dates/home-search`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}

export async function datesFuzzySearch(
    token: string,
    query: DatesFuzzySearchInputDto
): Promise<AxiosResponse<DatesFuzzySearchResponseDto>> {
    const self: T721SDK = this;

    return self.post<DatesFuzzySearchInputDto>(`/dates/fuzzy-search`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);

}


