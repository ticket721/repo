import { AxiosResponse }               from 'axios';
import { T721SDK }                     from '../../index';
import { DatesSearchInputDto }         from '@app/server/controllers/dates/dto/DatesSearchInput.dto';
import { DatesSearchResponseDto }      from '@app/server/controllers/dates/dto/DatesSearchResponse.dto';
import { DatesCountInputDto }          from '@app/server/controllers/dates/dto/DatesCountInput.dto';
import { DatesCountResponseDto }       from '@app/server/controllers/dates/dto/DatesCountResponse.dto';
import { DatesHomeSearchInputDto }     from '@app/server/controllers/dates/dto/DatesHomeSearchInput.dto';
import { DatesHomeSearchResponseDto }  from '@app/server/controllers/dates/dto/DatesHomeSearchResponse.dto';
import { DatesFuzzySearchInputDto }    from '@app/server/controllers/dates/dto/DatesFuzzySearchInput.dto';
import { DatesFuzzySearchResponseDto } from '@app/server/controllers/dates/dto/DatesFuzzySearchResponse.dto';
import { DatesAddCategoryInputDto }    from '@app/server/controllers/dates/dto/DatesAddCategoryInput.dto';
import { DatesAddCategoryResponseDto } from '@app/server/controllers/dates/dto/DatesAddCategoryResponse.dto';
import { DatesEditInputDto }           from '@app/server/controllers/dates/dto/DatesEditInput.dto';
import { DatesEditResponseDto }        from '@app/server/controllers/dates/dto/DatesEditResponse.dto';
import { DatesDeleteResponseDto }      from '@app/server/controllers/dates/dto/DatesDeleteResponse.dto';
import { DatesOwnerResponseDto }       from '@app/server/controllers/dates/dto/DatesOwnerResponse.dto';

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

export async function datesOwner(
    token: string,
    date: string
): Promise<AxiosResponse<DatesOwnerResponseDto>> {

    const self: T721SDK = this;

    return self.get(`/dates/owner/${date}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    });
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

export async function datesAddCategory(
    token: string,
    date: string,
    query: Partial<DatesAddCategoryInputDto>,
): Promise<AxiosResponse<DatesAddCategoryResponseDto>> {

    const self: T721SDK = this;

    return self.post<Partial<DatesAddCategoryInputDto>>(`/dates/${date}/category`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function datesEdit(
    token: string,
    date: string,
    query: Partial<DatesEditInputDto>,
): Promise<AxiosResponse<DatesEditResponseDto>> {

    const self: T721SDK = this;

    return self.put<Partial<DatesEditInputDto>>(`/dates/${date}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, query);
}

export async function datesDelete(
    token: string,
    date: string
): Promise<AxiosResponse<DatesDeleteResponseDto>> {

    const self: T721SDK = this;

    return self.delete(`/dates/${date}`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }, null);
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


