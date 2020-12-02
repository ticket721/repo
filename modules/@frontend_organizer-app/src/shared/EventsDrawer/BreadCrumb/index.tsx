import React from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import { categoryParam, dateParam, eventParam } from '../../../screens/types';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import './locales';

export const BreadCrumb: React.FC = () => {
    const [ t ] = useTranslation('breadcrumb');

    const routeMatch = useRouteMatch<eventParam & dateParam & categoryParam>([
        '/event/:eventId/date/:dateId',
        '/event/:eventId']);

    const history = useHistory();

    return <BreadCrumbContainer>
        <Link
        onClick={() => history.push('/')}>
            {t('dashboard')}
        </Link>
        {
            routeMatch?.params.eventId ?
            <>
                /
                <Link
                onClick={() => history.push(`/event/${routeMatch?.params.eventId}`)}>
                {t('event')}
            </Link>
            </> :
            null
        }
        {
            routeMatch?.params.eventId && routeMatch?.params.dateId ?
            <>
                /
                <Link
                onClick={() => history.push(`/event/${routeMatch?.params.eventId}/date/${routeMatch?.params.dateId}/dates-typology`)}>
                    {t('date')}
                </Link>
            </> :
            null
        }
    </BreadCrumbContainer>;
}

const Link = styled.span`
    color: ${props => props.theme.primaryColor.hex};
    cursor: pointer;
    padding: 0 ${props => props.theme.smallSpacing};

    &:hover {
        text-decoration: underline;
    }

    &.category-title {
        text-transform: uppercase;
        margin-top: ${props => props.theme.regularSpacing};
    }

    &:last-child {
        color: ${props => props.theme.textColor};
        pointer-events: none;
        font-weight: 600;
    }
`;

const BreadCrumbContainer = styled.div`
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: ${props => props.theme.biggerSpacing} ${props => props.theme.smallSpacing} 0;
    padding-top: ;
    font-size: 14px;
    background-color: ${props => props.theme.darkerBg};
`;
