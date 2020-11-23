import * as React from 'react';
import styled from '../../../config/styled';
import { OnlineBadge } from '../../events/single-image/OnlineTag';

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

const Container = styled.div<SearchResultsProps>`
    width: 100%;
`;

const ImgContainer = styled.div<{ src: string }>`
    border-radius: ${(props) => props.theme.defaultRadius};
    padding-top: max(80px, 10vw);
    margin-right: max(${(props) => props.theme.regularSpacing}, 1.5vw);
    overflow: hidden;
    width: max(80px, 10vw);
    position: relative;
    background-image: url(${(props) => props.src});
    background-size: cover;
    background-position: center;
`;

const SingleResult = styled.article<React.ComponentProps<any>>`
    align-items: center;
    display: flex;
    font-size: max(13px, 1vw);
    margin-bottom: max(${(props) => props.theme.regularSpacing}, 5%);
    width: 100%;
    cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};

    &:last-of-type {
        margin-bottom: ${(props) => props.customMarginBottom || props.theme.biggerSpacing};
    }

    & > div:last-child > span {
        color: ${(props) => props.theme.textColorDark};
        display: block;
        margin-top: max(12px, 12%);

        &:first-of-type {
            margin-top: max(${(props) => props.theme.smallSpacing}, 8%);
        }
    }
`;

const CategorySection = styled.section`
    padding: ${(props) => props.theme.biggerSpacing} ${(props) => props.theme.biggerSpacing};

    h2 {
        font-size: max(18px, 1.4vw);
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
    font-size: max(12px, 1.4vw);
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
`;

const AbsoluteOnlineTagDiv = styled.div`
    position: absolute;
    right: 2px;
    top: 2px;
`;

export const SingleEvent = (props: Event & { customMarginBottom?: string; online?: boolean }) => {
    return (
        <SingleResult clickable={!!props.onClick} onClick={props.onClick} customMarginBottom={props.customMarginBottom}>
            <ImgContainer src={props.image}>
                {props.online ? (
                    <AbsoluteOnlineTagDiv>
                        <OnlineBadge />
                    </AbsoluteOnlineTagDiv>
                ) : null}
            </ImgContainer>
            <div>
                <EllipsedTitle>{props.name}</EllipsedTitle>
                <span>{props.date}</span>
                <span style={{ color: props.color }}>{props.price}</span>
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
