import React, { useState }             from 'react';
import styled                          from 'styled-components';
import { DateEntity }                  from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { TicketDateCategoryList }      from './TicketDateCategoryList';
import { TicketSelectionCta }          from './TicketSelectionCta';
import { useTranslation }              from 'react-i18next';
import { OnlineTag }                   from '@frontend/flib-react/lib/components/events/single-image/OnlineTag';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { Error, FullPageLoading }      from '@frontend/flib-react/lib/components';
import { useSelector }                 from 'react-redux';
import { T721AppState }                from '../../redux';
import { v4 }                          from 'uuid';

export interface TicketCategoryFetcherProps {
    date: DateEntity;
}

const TicketSelectionContainer = styled.div`
    padding-top: ${props => props.theme.regularSpacing};
    padding-bottom: calc(80px + ${props => props.theme.regularSpacing});
`;

const TicketSelectionTitle = styled.h1`
    margin-left: ${props => props.theme.regularSpacing};
`;

const OnlineTagContainer = styled.div`
  position: fixed;
  top: 14px;
  right: 14px;
  z-index: 9999;
`;

const NoCategoriesContainer = styled.div`
  width: 100%;
  height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

interface NoCategoriesProps {
    color: string;
}

const NoCategories = styled.p<NoCategoriesProps>`
  color: ${props => props.color};
`

export const TicketCategoryFetcher: React.FC<TicketCategoryFetcherProps> = (props: TicketCategoryFetcherProps): JSX.Element => {

    const [selection, setSelection] = useState({ selection: null, category: null });
    const [t] = useTranslation('event_ticket_list')
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());

    const categories = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [token, {
            id: {
                $in: props.date.categories,
            },
            status: {
                $eq: 'live'
            },
            $sort: [{
                $field_name: 'created_at',
                $order: 'asc'
            }]
        }],
        refreshRate: 5,
    }, `HomeEvent@${uuid}`);

    if (categories.response.loading) {
        return <FullPageLoading width={250} height={250}/>;
    }

    if (categories.response.error) {
        return <Error message={t('error_cannot_fetch_categories')} retryLabel={t('common:retrying_in')} onRefresh={categories.force}/>;
    }

    const liveCategories = categories.response.data.categories;

    return <TicketSelectionContainer>
        {
            props.date.online

                ?
                <OnlineTagContainer>
                    <OnlineTag
                        online={t('online')}
                    />
                </OnlineTagContainer>

                :
                null
        }
        {
            liveCategories.length > 0

                ?
                <>
                    <TicketSelectionTitle>{t('title')}</TicketSelectionTitle>
                    <TicketDateCategoryList
                        categories={liveCategories}
                        date={props.date}
                        selection={selection.selection}
                        setSelection={setSelection}
                    />
                    <TicketSelectionCta gradients={props.date.metadata.signature_colors} category={selection.category}/>
                </>

                :
                <NoCategoriesContainer>
                    <NoCategories color={props.date.metadata.signature_colors[0]} >{t('no_categories')}</NoCategories>
                </NoCategoriesContainer>
        }
    </TicketSelectionContainer>;
};
