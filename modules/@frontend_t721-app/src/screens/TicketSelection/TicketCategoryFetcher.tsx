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
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { v4 }                          from 'uuid';
import { isRequestError }              from '@frontend/core/lib/utils/isRequestError';

export interface TicketCategoryFetcherProps {
    date: DateEntity;
}

const TicketSelectionContainer = styled.div`
    width: 100vw;
    @media screen and (min-width: 900px) {
      width: 900px;
    }
    padding-bottom: calc(80px + ${props => props.theme.regularSpacing} + env(safe-area-inset-bottom));
    padding-bottom: calc(80px + ${props => props.theme.regularSpacing} + constant(safe-area-inset-bottom));
`;

const TicketSelectionTitle = styled.h1`
    margin-left: ${props => props.theme.regularSpacing};
    margin-top: 0;
    margin-bottom: 0;
`;

const OnlineTagContainer = styled.div`

    margin-left: ${props => props.theme.regularSpacing};

    @media screen and (max-width: 900px) {
      margin-left: 0;
      position: fixed;
      top: calc(10px + env(safe-area-inset-top));
      top: calc(10px + constant(safe-area-inset-top));
      right: 14px;
    }
  z-index: 9999;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: ${props => props.theme.regularSpacing};
`

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
    const token = useToken();
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

    if (isRequestError(categories)) {
        return <Error message={t('error_cannot_fetch_categories')} retryLabel={t('common:retrying_in')} onRefresh={categories.force}/>;
    }

    const liveCategories = categories.response.data.categories;

    return <TicketSelectionContainer>
        {
            liveCategories.length > 0

                ?
                <>
                    <TitleContainer>
                        <TicketSelectionTitle>
                            {t('title')}
                        </TicketSelectionTitle>
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
                    </TitleContainer>
                    <TicketDateCategoryList
                        categories={liveCategories}
                        date={props.date}
                        selection={selection.selection}
                        setSelection={setSelection}
                    />
                    <TicketSelectionCta
                        date={props.date}
                        gradients={props.date.metadata.signature_colors}
                        category={selection.category}
                        clearSelection={() => setSelection({selection: null, category: null})}
                    />
                </>

                :
                <NoCategoriesContainer>
                    <NoCategories color={props.date.metadata.signature_colors[0]} >{t('no_categories')}</NoCategories>
                </NoCategoriesContainer>
        }
    </TicketSelectionContainer>;
};
