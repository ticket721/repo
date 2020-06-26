import React, { useState }          from 'react';
import styled                       from 'styled-components';
import { DateEntity }               from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { TicketDateCategoryList }   from './TicketDateCategoryList';
import { TicketGlobalCategoryList } from './TicketGlobalCategoryList';
import { TicketSelectionCta }       from './TicketSelectionCta';

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

export const TicketCategoryFetcher: React.FC<TicketCategoryFetcherProps> = (props: TicketCategoryFetcherProps): JSX.Element => {

    const [selection, setSelection] = useState({ section: null, selection: null, category: null });

    return <TicketSelectionContainer>
        <TicketSelectionTitle>Select Category</TicketSelectionTitle>
        <TicketDateCategoryList date={props.date} selection={selection.selection} section={selection.section} setSelection={setSelection}/>
        <br/>
        <TicketGlobalCategoryList date={props.date} selection={selection.selection} section={selection.section} setSelection={setSelection}/>
        <TicketSelectionCta gradients={props.date.metadata.signature_colors} category={selection.category}/>
    </TicketSelectionContainer>;
};
