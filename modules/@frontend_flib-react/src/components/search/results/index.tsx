import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';
import { OnlineTag } from '../../events/single-image/OnlineTag';

export interface SearchResultsProps extends React.ComponentProps<any> {
    noResultsLabel: string;
    searchResults: SearchCategory[];
}

interface SearchCategory {
    id: string | number;
    name: string;
    url: string;
    viewResultsLabel?: string;
    onViewResults?: () => void;
    results: JSX.Element[];
}

interface Event {
    color: string;
    name: string;
    id: string | number;
    price: string;
    date: string;
    image: string;
    onClick?: () => void;
}

interface Location {
    id: string | number;
    name: string;
    numberEvents: number;
    url: string;
    onClick?: () => void;
}

const Container = styled.div<SearchResultsProps>`
    width: 100%;
`;

const ImgContainer = styled.div`
    border-radius: ${(props) => props.theme.defaultRadius};
    height: 80px;
    margin-right: ${(props) => props.theme.regularSpacing};
    overflow: hidden;
    width: 80px;
    position: relative;

    &.icon {
        align-items: center;
        background-color: ${(props) => props.theme.componentColorLight};
        height: 56px;
        display: flex;
        justify-content: center;
        width: 56px;

        svg {
            height: 24px;
        }
    }

    img {
        height: 100%;
        object-fit: cover;
        width: 100%;
    }

    span {
        margin-top: 0 !important;
    }
`;

const SingleResult = styled.article<React.ComponentProps<any>>`
    align-items: center;
    display: flex;
    font-size: 13px;
    margin-bottom: ${(props) => props.theme.regularSpacing};
    width: 100%;
    cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};

    &:last-of-type {
        margin-bottom: ${(props) => props.customMarginBottom || props.theme.biggerSpacing};
    }

    span {
        color: ${(props) => props.theme.textColorDark};
        display: block;
        margin-top: ${(props) => props.theme.smallSpacing};

        &:first-of-type {
            margin-top: 4px;
        }
    }
`;

const CategorySection = styled.section`
    padding: ${(props) => props.theme.biggerSpacing} ${(props) => props.theme.biggerSpacing};

    h2 {
        margin-bottom: ${(props) => props.theme.regularSpacing};
    }

    a {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: ${(props) => props.theme.defaultRadius};
        color: ${(props) => props.theme.textColor};
        display: block;
        font-size: 15px;
        font-weight: 500;
        padding: ${(props) => props.theme.regularSpacing};
        text-align: center;
    }
`;

const EllipsedTitle = styled.h4`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const InfoContainer = styled.div`
    width: calc(90% - 80px);
`;

const AbsoluteOnlineTagDiv = styled.div`
    position: absolute;
    right: 2px;
    top: 2px;
`;

export const SingleEvent = (props: Event & { customMarginBottom?: string; online?: boolean }) => {
    return (
        <SingleResult clickable={!!props.onClick} onClick={props.onClick} customMarginBottom={props.customMarginBottom}>
            <ImgContainer>
                <img src={props.image} />
                {props.online ? (
                    <AbsoluteOnlineTagDiv>
                        <OnlineTag online={null} />
                    </AbsoluteOnlineTagDiv>
                ) : null}
            </ImgContainer>
            <InfoContainer>
                <EllipsedTitle className={'uppercase'}>{props.name}</EllipsedTitle>
                <span>{props.date}</span>
                <span style={{ color: props.color }}>{props.price}</span>
            </InfoContainer>
        </SingleResult>
    );
};

export const SingleStarEvent = (props: Event & { customMarginBottom?: string }) => {
    return (
        <SingleResult clickable={!!props.onClick} onClick={props.onClick} customMarginBottom={props.customMarginBottom}>
            <ImgContainer>
                <img src={props.image} />
            </ImgContainer>
            <InfoContainer>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
                    <Icon icon={'star'} size={'12px'} color={props.color} />
                    <EllipsedTitle style={{ marginLeft: '6px' }} className={'uppercase'}>
                        {props.name}
                    </EllipsedTitle>
                </div>
                <span>{props.date}</span>
                <span style={{ color: props.color }}>{props.price}€</span>
            </InfoContainer>
        </SingleResult>
    );
};

export const SingleLocation = (props: Location) => {
    return (
        <SingleResult>
            <ImgContainer className={'icon'}>
                <Icon icon={'pin'} size={'16px'} color={'rgba(255, 255, 255, 0.6)'} />
            </ImgContainer>
            <div>
                <h4>{props.name}</h4>
                <span>{props.numberEvents} events</span>
            </div>
        </SingleResult>
    );
};

export const CategoryResult = (props: any) => {
    return (
        <CategorySection>
            <h2>{props.category.name}</h2>
            {props.category.results}
            {props.category.viewResultsLabel ? (
                <a onClick={props.category.onViewResults}>{props.category.viewResultsLabel}</a>
            ) : null}
        </CategorySection>
    );
};

export const SearchResults: React.FunctionComponent<SearchResultsProps & { className?: string }> = (
    props: SearchResultsProps,
): JSX.Element => {
    return (
        <Container className={props.className}>
            {props.searchResults.length ? (
                props.searchResults.map((category: SearchCategory) => {
                    return <CategoryResult key={category.id} category={category} />;
                })
            ) : (
                <CategorySection>
                    <h2>{props.noResultsLabel}</h2>
                </CategorySection>
            )}
        </Container>
    );
};

SearchResults.defaultProps = {
    mainColor: '#079CF0',
};

export default SearchResults;
